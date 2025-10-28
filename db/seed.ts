import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "./index";
import { examsTable, questionsTable } from "./schema";
import { codeDesignQuestions } from "./seed-data/code-design-questions";
import { architectureQuestions } from "./seed-data/architecture-questions";
import { databaseQuestions } from "./seed-data/database-questions";
import { devopsQuestions } from "./seed-data/devops-questions";

async function seed() {
  console.log("🌱 开始种子数据导入...");

  try {
    // 1. 创建默认考试模板
    console.log("📝 创建考试模板...");
    const exams = await db
      .insert(examsTable)
      .values([
        {
          name: "前端工程师能力评估-TypeScript-Next.js",
          description: "面向前端工程师的技术能力评估，重点考察React/Next.js开发能力",
          role: "frontend",
          language: "typescript",
          framework: "nextjs",
          durationMinutes: 10,
          passingScore: 60,
          totalQuestions: 20,
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
          totalQuestions: 20,
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
          totalQuestions: 20,
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
          totalQuestions: 20,
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
          totalQuestions: 20,
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
          totalQuestions: 20,
          isActive: true,
        },
      ])
      .returning();

    console.log(`✅ 创建了 ${exams.length} 个考试模板`);

    // 2. 导入题库（80题）
    console.log("📚 导入题库...");

    const allQuestions = [
      ...codeDesignQuestions,
      ...architectureQuestions,
      ...databaseQuestions,
      ...devopsQuestions,
    ];

    // 分批插入以避免一次性插入过多数据
    const batchSize = 20;
    let insertedCount = 0;

    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize);
      await db.insert(questionsTable).values(batch);
      insertedCount += batch.length;
      console.log(`   插入了 ${insertedCount}/${allQuestions.length} 题...`);
    }

    console.log(`✅ 成功导入 ${allQuestions.length} 道题目`);
    console.log("\n📊 题目分布统计：");
    console.log(`   - 代码设计：${codeDesignQuestions.length} 题`);
    console.log(`   - 软件架构：${architectureQuestions.length} 题`);
    console.log(`   - 数据库建模：${databaseQuestions.length} 题`);
    console.log(`   - 运维能力：${devopsQuestions.length} 题`);

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
