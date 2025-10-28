import { db } from "@/db";
import {
  answersTable,
  examResultsTable,
  examSessionsTable,
  questionsTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * 职级映射
 */
function mapScoreToLevel(score: number): string {
  if (score >= 91) return "P9";
  if (score >= 76) return "P8";
  if (score >= 61) return "P7";
  if (score >= 41) return "P6";
  return "P5";
}

/**
 * 计算考试结果
 * 包括选择题自动评分、能力维度得分计算、职级映射
 */
export async function calculateExamResult(sessionId: string) {
  try {
    // 1. 获取会话信息
    const sessions = await db
      .select()
      .from(examSessionsTable)
      .where(eq(examSessionsTable.id, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      throw new Error("会话不存在");
    }

    const session = sessions[0];

    // 2. 获取所有答案及对应题目
    const answersWithQuestions = await db
      .select({
        answer: answersTable,
        question: questionsTable,
      })
      .from(answersTable)
      .innerJoin(
        questionsTable,
        eq(answersTable.questionId, questionsTable.id)
      )
      .where(eq(answersTable.sessionId, sessionId));

    if (answersWithQuestions.length === 0) {
      throw new Error("未找到答案记录");
    }

    // 3. 按能力维度分组计算得分
    const abilityScores: Record<
      string,
      { score: number; total: number }
    > = {
      code_design: { score: 0, total: 0 },
      architecture: { score: 0, total: 0 },
      database: { score: 0, total: 0 },
      devops: { score: 0, total: 0 },
    };

    for (const { answer, question } of answersWithQuestions) {
      const dimension = question.abilityDimension;
      const weight = question.weight;

      if (!abilityScores[dimension]) {
        abilityScores[dimension] = { score: 0, total: 0 };
      }

      // 选择题：使用is_correct字段
      if (question.type !== "essay") {
        if (answer.isCorrect === true) {
          abilityScores[dimension].score += weight;
        }
        abilityScores[dimension].total += weight;
      } else {
        // 简答题：只有已人工评分时才计入总分
        if (answer.manualScore !== null) {
          abilityScores[dimension].score += answer.manualScore;
          abilityScores[dimension].total += 5; // 简答题满分5分
        }
        // manualScore为null时跳过，既不计入分子也不计入分母
      }
    }

    // 4. 归一化到0-100
    const normalizedScores: Record<string, number> = {};
    for (const [dimension, { score, total }] of Object.entries(abilityScores)) {
      normalizedScores[dimension] =
        total > 0 ? Math.round((score / total) * 100) : 0;
    }

    // 5. 计算加权总分
    // 代码25% + 架构30% + 数据库25% + 运维20%
    const totalScore = Math.round(
      normalizedScores.code_design * 0.25 +
        normalizedScores.architecture * 0.3 +
        normalizedScores.database * 0.25 +
        normalizedScores.devops * 0.2
    );

    // 6. 职级映射
    const estimatedLevel = mapScoreToLevel(totalScore);

    // 7. 判断是否通过（60分及格）
    const passStatus = totalScore >= 60;

    // 8. 检查是否已存在结果记录
    const existingResults = await db
      .select()
      .from(examResultsTable)
      .where(eq(examResultsTable.sessionId, sessionId))
      .limit(1);

    if (existingResults.length > 0) {
      // 更新现有结果
      await db
        .update(examResultsTable)
        .set({
          totalScore,
          abilityScores: normalizedScores,
          estimatedLevel,
          passStatus,
        })
        .where(eq(examResultsTable.id, existingResults[0].id));
    } else {
      // 插入新结果
      await db.insert(examResultsTable).values({
        sessionId,
        userId: session.userId,
        totalScore,
        abilityScores: normalizedScores,
        estimatedLevel,
        passStatus,
      });
    }

    return {
      totalScore,
      abilityScores: normalizedScores,
      estimatedLevel,
      passStatus,
    };
  } catch (error) {
    console.error("计算考试结果失败：", error);
    throw error;
  }
}
