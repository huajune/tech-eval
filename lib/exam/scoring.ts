import { db } from "@/db";
import {
  answersTable,
  examResultsTable,
  examSessionsTable,
  questionsTable,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

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
    const selectedQuestionIds = session.selectedQuestions as string[];

    if (!selectedQuestionIds || selectedQuestionIds.length === 0) {
      throw new Error("会话中没有选定的题目");
    }

    // 2. 获取所有选定的题目（包括未作答的）
    const questions = await db
      .select()
      .from(questionsTable)
      .where(inArray(questionsTable.id, selectedQuestionIds));

    if (questions.length === 0) {
      throw new Error("未找到考试题目");
    }

    // 3. 获取所有答案记录（可能为空）
    const answerRecords = await db
      .select()
      .from(answersTable)
      .where(eq(answersTable.sessionId, sessionId));

    // 创建答案映射表
    const answerMap = new Map(
      answerRecords.map((a) => [a.questionId, a])
    );

    // 4. 按能力维度分组计算得分（基于所有选定的题目）
    const abilityScores: Record<
      string,
      { score: number; total: number }
    > = {
      code_design: { score: 0, total: 0 },
      architecture: { score: 0, total: 0 },
      database: { score: 0, total: 0 },
      devops: { score: 0, total: 0 },
      qa_testing: { score: 0, total: 0 },
    };

    for (const question of questions) {
      const dimension = question.abilityDimension;
      const weight = question.weight;
      const answer = answerMap.get(question.id);

      if (!abilityScores[dimension]) {
        abilityScores[dimension] = { score: 0, total: 0 };
      }

      // 选择题
      if (question.type !== "essay") {
        // 总分累加（无论是否作答）
        abilityScores[dimension].total += weight;

        // 只有答对才加分
        if (answer && answer.isCorrect === true) {
          abilityScores[dimension].score += weight;
        }
        // 未作答或答错：不加分（已在total中计入）
      } else {
        // 简答题：总是计入总分分母
        // 使用题目的实际权重（通常为5，但允许变化）
        abilityScores[dimension].total += weight;

        // 已人工评分：加上评分
        // 注意：manualScore是0-weight的分数，不是百分比
        if (answer && answer.manualScore !== null) {
          abilityScores[dimension].score += answer.manualScore;
        }
        // 未评分或未作答：计0分（已在total中计入）
      }
    }

    // 4. 归一化到0-100
    const normalizedScores: Record<string, number> = {};
    for (const [dimension, { score, total }] of Object.entries(abilityScores)) {
      normalizedScores[dimension] =
        total > 0 ? Math.round((score / total) * 100) : 0;
    }

    // 5. 计算加权总分
    // 代码20% + 架构20% + 数据库20% + 运维20% + QA20%
    const totalScore = Math.round(
      (normalizedScores.code_design || 0) * 0.2 +
        (normalizedScores.architecture || 0) * 0.2 +
        (normalizedScores.database || 0) * 0.2 +
        (normalizedScores.devops || 0) * 0.2 +
        (normalizedScores.qa_testing || 0) * 0.2
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
