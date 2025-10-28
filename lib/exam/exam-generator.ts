import { db } from "@/db";
import { questionsTable } from "@/db/schema";
import { and, isNull, or, sql } from "drizzle-orm";

export interface ExamConfig {
  role: "frontend" | "backend" | "fullstack";
  language: "typescript" | "java" | "python";
  framework?: string;
}

// 白名单枚举用于运行时校验
const VALID_ROLES = ["frontend", "backend", "fullstack"] as const;
const VALID_LANGUAGES = ["typescript", "java", "python"] as const;

/**
 * 校验配置参数，防止SQL注入
 */
function validateConfig(config: ExamConfig): void {
  if (!VALID_ROLES.includes(config.role)) {
    throw new Error(`无效的角色参数: ${config.role}`);
  }
  if (!VALID_LANGUAGES.includes(config.language)) {
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
 * 题目分布策略（总20题）：
 * - 代码设计：3易 + 2中 = 5题
 * - 软件架构：2易 + 2中 + 1难 = 5题
 * - 数据库建模：3易 + 2中 = 5题
 * - 运维能力：3易 + 1中 + 1难 = 5题
 *
 * 总计：11易 + 7中 + 2难 = 20题
 * 其中：18选择题 + 2简答题（架构1题 + 数据库1题）
 */
const QUESTION_DISTRIBUTION = {
  code_design: { easy: 3, medium: 2, hard: 0 },
  architecture: { easy: 2, medium: 2, hard: 1 }, // 1道hard是陈述题
  database: { easy: 3, medium: 2, hard: 0 }, // 1道medium是陈述题
  devops: { easy: 3, medium: 1, hard: 1 },
} as const;

/**
 * 从数组中随机选择n个元素
 */
function selectRandom<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
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
      .where(
        and(
          // 角色匹配：applicable_roles 包含当前角色（参数化查询）
          sql`${questionsTable.applicableRoles} @> ${JSON.stringify([config.role])}::jsonb`,
          // 语言匹配：applicable_languages 为 null（通用） 或包含当前语言
          or(
            isNull(questionsTable.applicableLanguages),
            sql`${questionsTable.applicableLanguages} @> ${JSON.stringify([config.language])}::jsonb`
          )
        )
      );

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

    // 3. 按策略抽题
    const selected: Question[] = [];
    const errors: string[] = [];

    for (const [dimension, distribution] of Object.entries(
      QUESTION_DISTRIBUTION
    )) {
      for (const [difficulty, count] of Object.entries(distribution)) {
        if (count > 0) {
          const pool = grouped[dimension]?.[difficulty] || [];

          if (pool.length < count) {
            // 题目不足，记录错误
            errors.push(
              `${dimension} - ${difficulty} 题目不足：需要${count}题，实际${pool.length}题`
            );
            selected.push(...pool);
          } else {
            // 随机选择指定数量的题目
            const picked = selectRandom(pool, count);
            selected.push(...picked);
          }
        }
      }
    }

    // 4. 如果有题目不足的情况，抛出错误终止会话创建
    if (errors.length > 0) {
      throw new Error(`题库不足，无法生成考试：\n${errors.join('\n')}`);
    }

    // 5. 验证题目数量（必须恰好20题）
    if (selected.length !== 20) {
      throw new Error(`题目数量错误：需要20题，实际生成${selected.length}题`);
    }

    const essayCount = selected.filter((q) => q.type === "essay").length;
    const choiceCount = selected.filter((q) => q.type !== "essay").length;

    console.log(`题目统计：总计${selected.length}题，选择题${choiceCount}题，简答题${essayCount}题`);

    // 5. 随机打乱顺序
    const shuffled = selected.sort(() => Math.random() - 0.5);

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
  if (questions.length !== 20) {
    errors.push(`题目总数应为20题，实际${questions.length}题`);
  }

  // 检查简答题数量
  const essayCount = questions.filter((q) => q.type === "essay").length;
  if (essayCount !== 2) {
    errors.push(`简答题应为2题，实际${essayCount}题`);
  }

  // 检查各维度题目数量
  const dimensionCounts: Record<string, number> = {};
  for (const question of questions) {
    dimensionCounts[question.abilityDimension] =
      (dimensionCounts[question.abilityDimension] || 0) + 1;
  }

  for (const [dimension, count] of Object.entries(dimensionCounts)) {
    if (count !== 5) {
      errors.push(`${dimension}维度应为5题，实际${count}题`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
