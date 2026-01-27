import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "./index";
import { examsTable, questionsTable } from "./schema";
import { sql } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import { codeDesignQuestions } from "./seed-data/code-design-questions";
import { architectureQuestions } from "./seed-data/architecture-questions";
import { databaseQuestions } from "./seed-data/database-questions";
import { devopsQuestions } from "./seed-data/devops-questions";
import { qaQuestions } from "./seed-data/qa-questions";

// 题库命名空间 UUID（固定值，用于生成确定性UUID）
const QUESTION_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

async function seed() {
  console.log("🌱 开始种子数据导入...");

  try {
    // 1. 创建/更新默认考试模板（使用UPSERT策略）
    console.log("📝 创建/更新考试模板...");

    const examTemplates = [
      {
        name: "前端工程师能力评估-TypeScript-Next.js",
        description: "面向前端工程师的技术能力评估，重点考察React/Next.js开发能力",
        role: "frontend",
        language: "typescript",
        framework: "nextjs",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "前端工程师能力评估-TypeScript-React",
        description: "面向前端工程师的技术能力评估，重点考察React开发能力",
        role: "frontend",
        language: "typescript",
        framework: "react",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "前端工程师能力评估-TypeScript-Vue",
        description: "面向前端工程师的技术能力评估，重点考察Vue开发能力",
        role: "frontend",
        language: "typescript",
        framework: "vue",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "前端工程师能力评估-JavaScript-React",
        description: "面向前端工程师的技术能力评估，重点考察React开发能力",
        role: "frontend",
        language: "javascript",
        framework: "react",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "前端工程师能力评估-JavaScript-Vue",
        description: "面向前端工程师的技术能力评估，重点考察Vue开发能力",
        role: "frontend",
        language: "javascript",
        framework: "vue",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "前端工程师能力评估-JavaScript-Next.js",
        description: "面向前端工程师的技术能力评估，重点考察Next.js开发能力",
        role: "frontend",
        language: "javascript",
        framework: "nextjs",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "后端工程师能力评估-Java-Spring",
        description: "面向后端工程师的技术能力评估，重点考察Spring Boot开发能力",
        role: "backend",
        language: "java",
        framework: "spring",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "后端工程师能力评估-Python-Django",
        description: "面向后端工程师的技术能力评估，重点考察Django开发能力",
        role: "backend",
        language: "python",
        framework: "django",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "后端工程师能力评估-TypeScript-Express",
        description: "面向后端工程师的技术能力评估，重点考察Node.js/Express开发能力",
        role: "backend",
        language: "typescript",
        framework: "express",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "全栈工程师能力评估-TypeScript",
        description: "面向全栈工程师的技术能力评估，综合考察前后端开发能力",
        role: "fullstack",
        language: "typescript",
        framework: "nextjs",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
      {
        name: "测试工程师能力评估",
        description: "面向测试工程师的技术能力评估，全面考察测试能力",
        role: "tester",
        // 生产数据库 language 字段为 NOT NULL，测试岗位用占位值
        language: "general",
        framework: "general",
        durationMinutes: 10,
        passingScore: 60,
        totalQuestions: 15,
        isActive: true,
      },
    ];

    // 为每个模板生成稳定的UUID
    // 测试岗位：基于role生成
    // 其他岗位：基于role+language+framework生成
    const examsWithIds = examTemplates.map((exam) => {
      const identifier = exam.role === "tester"
        ? `exam:${exam.role}`
        : `exam:${exam.role}:${exam.language}:${exam.framework || 'default'}`;
      const id = uuidv5(identifier, QUESTION_NAMESPACE);
      return { ...exam, id };
    });

    // UPSERT每个模板
    for (const exam of examsWithIds) {
      await db
        .insert(examsTable)
        .values(exam)
        .onConflictDoUpdate({
          target: examsTable.id,
          set: {
            name: sql`EXCLUDED.name`,
            description: sql`EXCLUDED.description`,
            durationMinutes: sql`EXCLUDED.duration_minutes`,
            passingScore: sql`EXCLUDED.passing_score`,
            totalQuestions: sql`EXCLUDED.total_questions`,
            isActive: sql`EXCLUDED.is_active`,
            updatedAt: sql`NOW()`,
          },
        });
    }

    console.log(`✅ 处理了 ${examsWithIds.length} 个考试模板`);

    // 2. 导入题库（使用UPSERT策略）
    console.log("📚 导入/更新题库...");

    // 为每道题目生成稳定的UUID（基于题目内容，确保幂等性）
    const addStableIds = <T extends { content: string }>(questions: T[], prefix: string) => {
      return questions.map((q) => {
        // 基于题目内容生成UUID，确保：
        // 1. 题目内容不变 → UUID不变 → UPSERT能正确更新
        // 2. 题目顺序改变 → UUID不变 → 不会重复插入
        // 3. 题目内容修改 → UUID改变 → 视为新题（保留旧考试记录）
        const name = `${prefix}:${q.content}`;
        const id = uuidv5(name, QUESTION_NAMESPACE);
        return { ...q, id };
      });
    };

    const allQuestionsWithIds = [
      ...addStableIds(codeDesignQuestions, "cd"),
      ...addStableIds(architectureQuestions, "arch"),
      ...addStableIds(databaseQuestions, "db"),
      ...addStableIds(devopsQuestions, "ops"),
      ...addStableIds(qaQuestions, "qa"),
    ];

    // 去除重复的题目（基于ID去重，保留第一个出现的）
    const uniqueQuestionsMap = new Map<string, typeof allQuestionsWithIds[0]>();
    for (const question of allQuestionsWithIds) {
      if (!uniqueQuestionsMap.has(question.id)) {
        uniqueQuestionsMap.set(question.id, question);
      }
    }
    const allQuestions = Array.from(uniqueQuestionsMap.values());

    console.log(`📊 去重前: ${allQuestionsWithIds.length} 题，去重后: ${allQuestions.length} 题`);

    // 分批插入/更新以避免一次性处理过多数据
    const batchSize = 20;
    let processedCount = 0;

    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize);

      // UPSERT: 如果ID存在则更新，否则插入
      await db
        .insert(questionsTable)
        .values(batch)
        .onConflictDoUpdate({
          target: questionsTable.id,
          set: {
            content: sql`EXCLUDED.content`,
            type: sql`EXCLUDED.type`,
            options: sql`EXCLUDED.options`,
            correctAnswer: sql`EXCLUDED.correct_answer`,
            abilityDimension: sql`EXCLUDED.ability_dimension`,
            difficulty: sql`EXCLUDED.difficulty`,
            weight: sql`EXCLUDED.weight`,
            applicableRoles: sql`EXCLUDED.applicable_roles`,
            applicableLanguages: sql`EXCLUDED.applicable_languages`,
            explanation: sql`EXCLUDED.explanation`,
            referenceAnswer: sql`EXCLUDED.reference_answer`,
            updatedAt: sql`NOW()`,
          },
        });

      processedCount += batch.length;
      console.log(`   处理了 ${processedCount}/${allQuestions.length} 题...`);
    }

    console.log(`✅ 成功导入 ${allQuestions.length} 道题目`);
    console.log("\n📊 题目分布统计：");
    console.log(`   - 代码设计：${codeDesignQuestions.length} 题`);
    console.log(`   - 软件架构：${architectureQuestions.length} 题`);
    console.log(`   - 数据库建模：${databaseQuestions.length} 题`);
    console.log(`   - 运维能力：${devopsQuestions.length} 题`);
    console.log(`   - QA 测试：${qaQuestions.length} 题`);

    console.log("\n✨ 种子数据导入完成！");
  } catch (error) {
    console.error("❌ 种子数据导入失败：", error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
