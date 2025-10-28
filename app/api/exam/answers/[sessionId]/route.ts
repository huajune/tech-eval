import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  answersTable,
  examSessionsTable,
  questionsTable,
  usersTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
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

    // 4. Verify ownership
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: "无权访问此内容" }, { status: 403 });
    }

    // 5. Check if exam is completed
    if (session.status !== "completed") {
      return NextResponse.json(
        {
          error: "考试尚未完成",
          redirectUrl: `/exam/${sessionId}`,
        },
        { status: 400 }
      );
    }

    // 6. Get all answers with questions
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

    // 7. Get selected question IDs to maintain order
    const selectedQuestionIds = session.selectedQuestions as string[];

    // 8. Build ordered response with full question details
    const orderedAnswers = selectedQuestionIds.map((questionId, index) => {
      const record = answersWithQuestions.find(
        (r) => r.question.id === questionId
      );

      if (!record) {
        return null;
      }

      const { answer, question } = record;

      return {
        questionNumber: index + 1,
        questionId: question.id,
        content: question.content,
        type: question.type,
        options: question.options,
        abilityDimension: question.abilityDimension,
        difficulty: question.difficulty,
        userAnswer: answer.userAnswer as string[],
        correctAnswer: question.correctAnswer as string[],
        isCorrect: answer.isCorrect,
        manualScore: answer.manualScore,
        explanation: question.explanation,
        referenceAnswer: question.referenceAnswer,
      };
    }).filter((item) => item !== null);

    return NextResponse.json(
      {
        sessionId,
        answers: orderedAnswers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取答案解析失败：", error);
    return NextResponse.json({ error: "获取答案解析失败" }, { status: 500 });
  }
}
