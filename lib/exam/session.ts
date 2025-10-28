import { db } from "@/db";
import { examSessionsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface ExamSession {
  id: string;
  userId: string;
  examId: string;
  status: string;
  startTime: Date;
  endTime: Date | null;
  selectedQuestions: string[];
  remainingSeconds: number;
  cheatingWarnings: number;
  createdAt: Date;
}

/**
 * 验证考试会话
 * 检查会话是否存在、是否属于当前用户、是否超时
 */
export async function validateExamSession(
  sessionId: string,
  userId: string
): Promise<{
  valid: boolean;
  session?: ExamSession;
  error?: string;
}> {
  try {
    // 查询会话
    const sessions = await db
      .select()
      .from(examSessionsTable)
      .where(
        and(
          eq(examSessionsTable.id, sessionId),
          eq(examSessionsTable.userId, userId)
        )
      )
      .limit(1);

    if (sessions.length === 0) {
      return { valid: false, error: "会话不存在或无权访问" };
    }

    const rawSession = sessions[0];

    // 检查会话状态
    if (rawSession.status === "completed") {
      return { valid: false, error: "考试已完成" };
    }

    if (rawSession.status === "terminated") {
      return { valid: false, error: "考试已终止（疑似作弊）" };
    }

    // 检查是否超时（10分钟 = 600秒）
    const elapsedMs = Date.now() - new Date(rawSession.startTime).getTime();
    const maxDurationMs = 10 * 60 * 1000;

    if (elapsedMs > maxDurationMs) {
      return { valid: false, error: "考试时间已到" };
    }

    // 类型转换Drizzle返回的unknown字段
    const session: ExamSession = {
      id: rawSession.id,
      userId: rawSession.userId,
      examId: rawSession.examId,
      status: rawSession.status,
      startTime: rawSession.startTime,
      endTime: rawSession.endTime,
      selectedQuestions: rawSession.selectedQuestions as string[],
      remainingSeconds: rawSession.remainingSeconds || 0,
      cheatingWarnings: rawSession.cheatingWarnings,
      createdAt: rawSession.createdAt,
    };

    return { valid: true, session };
  } catch (error) {
    console.error("验证会话失败：", error);
    return { valid: false, error: "验证会话失败" };
  }
}

/**
 * 计算剩余时间（秒）
 */
export function calculateRemainingSeconds(startTime: Date): number {
  const elapsedMs = Date.now() - startTime.getTime();
  const maxDurationMs = 10 * 60 * 1000; // 10分钟
  const remainingMs = Math.max(0, maxDurationMs - elapsedMs);
  return Math.floor(remainingMs / 1000);
}

interface QuestionWithAnswer {
  id: string;
  content: string;
  type: string;
  options: unknown;
  abilityDimension: string;
  correctAnswer?: unknown;
  weight?: number;
  explanation?: string | null;
  referenceAnswer?: string | null;
}

interface SanitizedQuestion {
  id: string;
  content: string;
  type: string;
  options: Record<string, string> | null;
  abilityDimension: string;
}

/**
 * 脱敏题目数据（移除答案信息）
 */
export function sanitizeQuestions(questions: QuestionWithAnswer[]): SanitizedQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    content: q.content,
    type: q.type,
    options: (q.options as Record<string, string>) || null,
    abilityDimension: q.abilityDimension,
    // 移除敏感字段
    // correctAnswer: REMOVED
    // weight: REMOVED
    // explanation: REMOVED
    // referenceAnswer: REMOVED
  }));
}
