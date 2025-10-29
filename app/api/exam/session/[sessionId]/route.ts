import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  examSessionsTable,
  examsTable,
  usersTable,
  questionsTable,
  answersTable,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { sanitizeQuestions } from "@/lib/exam/session";
import { calculateExamResult } from "@/lib/exam/scoring";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // 1. Verify user authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 2. Get database user
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    if (dbUsers.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const dbUser = dbUsers[0];

    // 3. Get session
    const sessions = await db
      .select()
      .from(examSessionsTable)
      .where(eq(examSessionsTable.id, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const session = sessions[0];

    // 4. Verify session ownership
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: "无权访问此会话" }, { status: 403 });
    }

    // 5. Check session status
    if (session.status === "terminated") {
      return NextResponse.json(
        { error: "考试已终止（疑似作弊）" },
        { status: 403 }
      );
    }

    if (session.status === "completed") {
      return NextResponse.json(
        {
          error: "考试已完成",
          redirectUrl: `/exam/${sessionId}/result`,
        },
        { status: 400 }
      );
    }

    // 6. Get exam template to retrieve duration
    const exams = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, session.examId))
      .limit(1);

    if (exams.length === 0) {
      return NextResponse.json({ error: "考试模板不存在" }, { status: 404 });
    }

    const exam = exams[0];

    // 7. Check if time expired (use exam template duration)
    const startTime = new Date(session.startTime);
    const elapsedMs = Date.now() - startTime.getTime();
    const maxDurationMs = exam.durationMinutes * 60 * 1000;

    if (elapsedMs > maxDurationMs) {
      // Auto-submit if time expired
      await db
        .update(examSessionsTable)
        .set({ status: "completed", endTime: new Date() })
        .where(eq(examSessionsTable.id, sessionId));

      // 触发自动评分（避免结果页404）
      try {
        await calculateExamResult(sessionId);
        console.log(`会话 ${sessionId} 时间过期自动提交并评分完成`);
      } catch (error) {
        console.error(`自动评分失败（会话 ${sessionId}）:`, error);
      }

      return NextResponse.json(
        {
          error: "考试时间已到，已自动提交",
          redirectUrl: `/exam/${sessionId}/result`,
        },
        { status: 400 }
      );
    }

    // 8. Get questions
    const selectedQuestionIds = session.selectedQuestions as string[];
    const questions = await db
      .select()
      .from(questionsTable)
      .where(inArray(questionsTable.id, selectedQuestionIds));

    // Sort questions to match the selected order
    const orderedQuestions = selectedQuestionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q) => q !== undefined);

    // 9. Get user's answers
    const answers = await db
      .select()
      .from(answersTable)
      .where(eq(answersTable.sessionId, sessionId));

    // Create a map of questionId -> userAnswer
    const answersMap = new Map(
      answers.map((a) => [a.questionId, a.userAnswer as string[]])
    );

    // 10. Sanitize questions and attach user answers
    const sanitizedQuestions = sanitizeQuestions(orderedQuestions).map((q) => ({
      ...q,
      userAnswer: answersMap.get(q.id) || null,
    }));

    // 11. Calculate remaining time
    const remainingSeconds = Math.max(
      0,
      Math.floor((maxDurationMs - elapsedMs) / 1000)
    );

    return NextResponse.json(
      {
        sessionId: session.id,
        status: session.status,
        startTime: session.startTime,
        remainingSeconds,
        durationMinutes: exam.durationMinutes,
        questions: sanitizedQuestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取考试会话失败：", error);
    return NextResponse.json({ error: "获取考试会话失败" }, { status: 500 });
  }
}
