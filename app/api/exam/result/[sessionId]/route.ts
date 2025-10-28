import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import {
  examResultsTable,
  examSessionsTable,
  usersTable,
  examsTable,
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
      .select({
        session: examSessionsTable,
        exam: examsTable,
      })
      .from(examSessionsTable)
      .innerJoin(examsTable, eq(examSessionsTable.examId, examsTable.id))
      .where(eq(examSessionsTable.id, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const { session, exam } = sessions[0];

    // 4. Verify ownership
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: "无权访问此结果" }, { status: 403 });
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

    // 6. Get result
    const results = await db
      .select()
      .from(examResultsTable)
      .where(eq(examResultsTable.sessionId, sessionId))
      .limit(1);

    if (results.length === 0) {
      return NextResponse.json({ error: "结果不存在" }, { status: 404 });
    }

    const result = results[0];

    // 7. Calculate time taken
    const startTime = new Date(session.startTime);
    const endTime = session.endTime ? new Date(session.endTime) : new Date();
    const timeTakenMinutes = Math.round(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    return NextResponse.json(
      {
        sessionId: session.id,
        examName: exam.name,
        totalScore: result.totalScore,
        abilityScores: result.abilityScores,
        estimatedLevel: result.estimatedLevel,
        passStatus: result.passStatus,
        completedAt: result.completedAt,
        timeTakenMinutes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取考试结果失败：", error);
    return NextResponse.json({ error: "获取考试结果失败" }, { status: 500 });
  }
}
