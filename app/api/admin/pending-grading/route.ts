import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  answersTable,
  examSessionsTable,
  questionsTable,
  usersTable,
} from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. 验证用户登录
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 2. 验证管理员权限
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    if (dbUsers.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const dbUser = dbUsers[0];
    if (dbUser.role !== "admin") {
      return NextResponse.json(
        { error: "权限不足，仅限管理员访问" },
        { status: 403 }
      );
    }

    // 3. Get all essay answers that haven't been manually graded yet
    const pendingAnswers = await db
      .select({
        answer: answersTable,
        question: questionsTable,
        session: examSessionsTable,
        user: usersTable,
      })
      .from(answersTable)
      .innerJoin(
        questionsTable,
        eq(answersTable.questionId, questionsTable.id)
      )
      .innerJoin(
        examSessionsTable,
        eq(answersTable.sessionId, examSessionsTable.id)
      )
      .innerJoin(usersTable, eq(examSessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(questionsTable.type, "essay"),
          eq(examSessionsTable.status, "completed"),
          isNull(answersTable.manualScore)
        )
      );

    // Group by session
    interface PendingSession {
      sessionId: string;
      userId: string;
      userEmail: string;
      userName: string | null;
      completedAt: Date | null;
      answers: Array<{
        answerId: string;
        questionId: string;
        questionContent: string;
        userAnswer: string;
        referenceAnswer: string | null;
        explanation: string | null;
        abilityDimension: string;
        weight: number; // 题目权重（满分）
      }>;
    }

    const groupedBySession = pendingAnswers.reduce(
      (acc, record) => {
        const sessionId = record.session.id;
        if (!acc[sessionId]) {
          acc[sessionId] = {
            sessionId,
            userId: record.user.id,
            userEmail: record.user.email,
            userName: record.user.fullName,
            completedAt: record.session.endTime,
            answers: [],
          };
        }

        acc[sessionId].answers.push({
          answerId: record.answer.id,
          questionId: record.question.id,
          questionContent: record.question.content,
          userAnswer: (record.answer.userAnswer as string[])?.[0] || "",
          referenceAnswer: record.question.referenceAnswer,
          explanation: record.question.explanation,
          abilityDimension: record.question.abilityDimension,
          weight: record.question.weight, // 添加权重字段
        });

        return acc;
      },
      {} as Record<string, PendingSession>
    );

    const result = Object.values(groupedBySession);

    return NextResponse.json(
      {
        pendingSessions: result,
        totalCount: result.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取待评分列表失败：", error);
    return NextResponse.json(
      { error: "获取待评分列表失败" },
      { status: 500 }
    );
  }
}
