import { db } from "@/db";
import { questionsTable } from "@/db/schema";
import { and, isNull, or, sql } from "drizzle-orm";

export interface ExamConfig {
  role: "frontend" | "backend" | "fullstack" | "tester";
  language?: "typescript" | "javascript" | "java" | "python";
  framework?: string;
}

// 白名单枚举用于运行时校验
const VALID_ROLES = ["frontend", "backend", "fullstack", "tester"] as const;
const VALID_LANGUAGES = ["typescript", "javascript", "java", "python"] as const;

/**
 * 校验配置参数，防止SQL注入
 */
function validateConfig(config: ExamConfig): void {
  if (!VALID_ROLES.includes(config.role)) {
    throw new Error(`无效的角色参数: ${config.role}`);
  }
  // 测试岗位不需要language参数
  if (config.role !== "tester" && !config.language) {
    throw new Error(`缺少必要参数：language`);
  }
  if (config.language && !VALID_LANGUAGES.includes(config.language)) {
    throw new Error(`无效的编程语言参数: ${config.language}`);
  }
}

export interface Question {
  id: string;
  content: string;
  type: "single" | "multiple" | "essay";
  options: Record<string, string> | null;
  abilityDimension: string;
  difficulty: string;
  weight: number;
  applicableRoles: string[];
  applicableLanguages: string[] | null;
}

/**
 * 题目分布策略（总15题）：
 * - 代码设计：2易 + 1中 = 3题
 * - 软件架构：2易 + 1中 = 3题
 * - 数据库建模：2易 + 1中 = 3题
 * - 运维能力：2易 + 1中 = 3题
 * - QA测试：2易 + 1中 = 3题
 *
 * 总计：10易 + 5中 = 15题
 */
const QUESTION_DISTRIBUTION = {
  code_design: { easy: 2, medium: 1, hard: 0 },
  architecture: { easy: 2, medium: 1, hard: 0 },
  database: { easy: 2, medium: 1, hard: 0 },
  devops: { easy: 2, medium: 1, hard: 0 },
  qa_testing: { easy: 2, medium: 1, hard: 0 },
} as const;

/**
 * 从数组中随机选择n个元素
 * 使用Fisher-Yates洗牌算法，保证真正的随机性和均匀分布
 */
function selectRandom<T>(array: T[], count: number): T[] {
  const shuffled = [...array];

  // Fisher-Yates (Knuth) shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * 按维度和难度分组题目
 */
function groupQuestions(questions: Question[]) {
  const grouped: Record<string, Record<string, Question[]>> = {
    code_design: { easy: [], medium: [], hard: [] },
    architecture: { easy: [], medium: [], hard: [] },
    database: { easy: [], medium: [], hard: [] },
    devops: { easy: [], medium: [], hard: [] },
    qa_testing: { easy: [], medium: [], hard: [] },
  };

  for (const question of questions) {
    const dimension = question.abilityDimension;
    const difficulty = question.difficulty;
    if (grouped[dimension] && grouped[dimension][difficulty]) {
      grouped[dimension][difficulty].push(question);
    }
  }

  return grouped;
}

/**
 * 生成考试题目
 * 根据角色、语言筛选题库，按照固定分布策略抽取20题
 */
export async function generateExamQuestions(
  config: ExamConfig
): Promise<Question[]> {
  try {
    // 校验参数，防止SQL注入
    validateConfig(config);

    // 1. 筛选适用题目（使用参数化JSONB查询）
    // 所有岗位都按applicableRoles筛选，测试岗位不需要language参数
    let whereCondition;
    if (config.role === "tester") {
      // 测试岗位：按applicableRoles筛选（包含"tester"的题目）
      whereCondition = sql`${questionsTable.applicableRoles} @> ${JSON.stringify([config.role])}::jsonb`;
    } else {
      // 其他岗位：按角色和语言筛选
      whereCondition = and(
        // 角色匹配：applicable_roles 包含当前角色（参数化查询）
        sql`${questionsTable.applicableRoles} @> ${JSON.stringify([config.role])}::jsonb`,
        // 语言匹配：applicable_languages 为 null（通用） 或包含当前语言
        or(
          isNull(questionsTable.applicableLanguages),
          sql`${questionsTable.applicableLanguages} @> ${JSON.stringify([config.language!])}::jsonb`
        )
      );
    }

    const allQuestions = await db
      .select({
        id: questionsTable.id,
        content: questionsTable.content,
        type: questionsTable.type,
        options: questionsTable.options,
        abilityDimension: questionsTable.abilityDimension,
        difficulty: questionsTable.difficulty,
        weight: questionsTable.weight,
        applicableRoles: questionsTable.applicableRoles,
        applicableLanguages: questionsTable.applicableLanguages,
      })
      .from(questionsTable)
      .where(whereCondition);

    if (allQuestions.length === 0) {
      throw new Error("没有找到符合条件的题目");
    }

    // 2. 按维度和难度分组 (需要类型转换因为Drizzle返回unknown类型)
    const typedQuestions: Question[] = allQuestions.map(q => ({
      id: q.id,
      content: q.content,
      type: q.type as "single" | "multiple" | "essay",
      options: q.options as Record<string, string> | null,
      abilityDimension: q.abilityDimension,
      difficulty: q.difficulty,
      weight: q.weight,
      applicableRoles: q.applicableRoles as string[],
      applicableLanguages: q.applicableLanguages as string[] | null,
    }));

    const grouped = groupQuestions(typedQuestions);

    // 3. 按策略抽题：优先抽满15题，从对应的applicableRoles抽取，题目充足时再考虑难度分布
    const selected: Question[] = [];
    const warnings: string[] = [];
    const targetTotal = 15; // 目标总数
    const targetEasy = 10; // 目标简单题数（题目充足时）
    const targetMedium = 5; // 目标中等题数（题目充足时）

    // 第一步：收集所有可用的题目（按难度分组，不限制维度）
    const allEasy: Question[] = [];
    const allMedium: Question[] = [];
    const allHard: Question[] = [];
    
    for (const dimension of Object.keys(QUESTION_DISTRIBUTION)) {
      allEasy.push(...(grouped[dimension]?.easy || []));
      allMedium.push(...(grouped[dimension]?.medium || []));
      allHard.push(...(grouped[dimension]?.hard || []));
    }

    // 第二步：优先抽取easy题目到10题（如果题目充足）
    if (allEasy.length >= targetEasy) {
      selected.push(...selectRandom(allEasy, targetEasy));
    } else {
      // easy题目不足，使用所有easy题目
      selected.push(...allEasy);
      warnings.push(`easy题目不足：需要${targetEasy}题，实际${allEasy.length}题`);
    }

    // 第三步：抽取medium题目到5题（如果题目充足，且排除已选中的题目）
    const selectedIds = new Set(selected.map(q => q.id));
    const availableMedium = allMedium.filter(q => !selectedIds.has(q.id));
    
    if (availableMedium.length >= targetMedium) {
      selected.push(...selectRandom(availableMedium, targetMedium));
    } else {
      // medium题目不足，使用所有可用的medium题目
      selected.push(...availableMedium);
      if (availableMedium.length < targetMedium) {
        warnings.push(`medium题目不足：需要${targetMedium}题，实际${availableMedium.length}题`);
      }
    }

    // 第四步：如果总数不足15题，从剩余题目中补全（优先easy，其次medium，最后hard）
    const currentTotal = selected.length;
    if (currentTotal < targetTotal) {
      const needed = targetTotal - currentTotal;
      let remaining = needed;
      
      // 更新已选中的ID集合
      const currentSelectedIds = new Set(selected.map(q => q.id));
      
      // 优先从easy题目补全
      const remainingEasy = allEasy.filter(q => !currentSelectedIds.has(q.id));
      if (remainingEasy.length > 0 && remaining > 0) {
        const easyToAdd = Math.min(remaining, remainingEasy.length);
        selected.push(...selectRandom(remainingEasy, easyToAdd));
        remaining -= easyToAdd;
        remainingEasy.forEach(q => currentSelectedIds.add(q.id));
      }
      
      // 其次从medium题目补全
      if (remaining > 0) {
        const remainingMedium = allMedium.filter(q => !currentSelectedIds.has(q.id));
        if (remainingMedium.length > 0) {
          const mediumToAdd = Math.min(remaining, remainingMedium.length);
          selected.push(...selectRandom(remainingMedium, mediumToAdd));
          remaining -= mediumToAdd;
          remainingMedium.forEach(q => currentSelectedIds.add(q.id));
        }
      }
      
      // 最后从hard题目补全（如果还需要）
      if (remaining > 0) {
        const remainingHard = allHard.filter(q => !currentSelectedIds.has(q.id));
        if (remainingHard.length > 0) {
          const hardToAdd = Math.min(remaining, remainingHard.length);
          selected.push(...selectRandom(remainingHard, hardToAdd));
          remaining -= hardToAdd;
        }
      }
      
      if (remaining > 0) {
        warnings.push(`无法补全到15题：还缺少${remaining}题`);
      }
    }

    // 第五步：记录警告信息
    if (warnings.length > 0) {
      console.warn(`题库部分不足：\n${warnings.join('\n')}`);
    }

    // 第六步：验证题目数量
    const finalTotal = selected.length;
    const finalEasy = selected.filter(q => q.difficulty === 'easy').length;
    const finalMedium = selected.filter(q => q.difficulty === 'medium').length;
    
    console.log(`题目统计：总计${finalTotal}题（简单${finalEasy}题，中等${finalMedium}题）`);

    const minRequiredQuestions = 10; // 最少需要10题才能开始考试
    if (finalTotal < minRequiredQuestions) {
      throw new Error(
        `题目数量不足：需要至少${minRequiredQuestions}题才能开始考试，实际生成${finalTotal}题。\n` +
        `请检查题库配置，确保有足够的题目。\n` +
        `警告信息：\n${warnings.join('\n')}`
      );
    }
    
    // 如果题目数量少于15题，记录警告但不阻止
    if (finalTotal < targetTotal) {
      console.warn(`题目数量不足：期望${targetTotal}题，实际${finalTotal}题，将使用现有题目继续`);
    }

    // 6. 验证题目ID唯一性（防止重复）
    const uniqueIds = new Set(selected.map(q => q.id));
    if (uniqueIds.size !== selected.length) {
      throw new Error(`题目存在重复：生成${selected.length}题，但只有${uniqueIds.size}个唯一ID`);
    }

    const essayCount = selected.filter((q) => q.type === "essay").length;
    const choiceCount = selected.filter((q) => q.type !== "essay").length;

    console.log(`题目统计：总计${selected.length}题，选择题${choiceCount}题，简答题${essayCount}题`);

    // 7. 随机打乱顺序（使用Fisher-Yates算法）
    const shuffled = [...selected];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  } catch (error) {
    console.error("生成考试题目失败：", error);
    throw error;
  }
}

/**
 * 验证题目分布是否符合要求
 */
export function validateQuestionDistribution(questions: Question[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查总数
  if (questions.length !== 15) {
    errors.push(`题目总数应为15题，实际${questions.length}题`);
  }

  // 检查各维度题目数量
  const dimensionCounts: Record<string, number> = {};
  for (const question of questions) {
    dimensionCounts[question.abilityDimension] =
      (dimensionCounts[question.abilityDimension] || 0) + 1;
  }

  for (const [dimension, count] of Object.entries(dimensionCounts)) {
    if (count !== 3) {
      errors.push(`${dimension}维度应为3题，实际${count}题`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
