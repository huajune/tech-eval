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

/**
 * 获取所有考试结果（仅管理员）
 */
export async function GET() {
  try {
    // 1. Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 2. Get database user and verify admin role
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
        { error: "权限不足，仅管理员可访问" },
        { status: 403 }
      );
    }

    // 3. Get all exam results with related data
    const results = await db
      .select({
        result: examResultsTable,
        session: examSessionsTable,
        exam: examsTable,
        user: usersTable,
      })
      .from(examResultsTable)
      .innerJoin(
        examSessionsTable,
        eq(examResultsTable.sessionId, examSessionsTable.id)
      )
      .innerJoin(examsTable, eq(examSessionsTable.examId, examsTable.id))
      .innerJoin(usersTable, eq(examResultsTable.userId, usersTable.id))
      .orderBy(examResultsTable.completedAt);

    // 4. Format results
    const formattedResults = results.map(({ result, session, exam, user }) => {
      const startTime = new Date(session.startTime);
      const endTime = session.endTime ? new Date(session.endTime) : new Date();
      const timeTakenMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / 60000
      );

      return {
        resultId: result.id,
        sessionId: session.id,
        userId: user.id,
        userEmail: user.email,
        userName: user.fullName || "未设置",
        examName: exam.name,
        examRole: exam.role,
        examLanguage: exam.language,
        examFramework: exam.framework,
        totalScore: result.totalScore,
        abilityScores: result.abilityScores,
        estimatedLevel: result.estimatedLevel,
        passStatus: result.passStatus,
        completedAt: result.completedAt,
        timeTakenMinutes,
        sessionStatus: session.status,
        cheatingWarnings: session.cheatingWarnings,
      };
    });

    return NextResponse.json(
      {
        results: formattedResults,
        total: formattedResults.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取考试结果列表失败：", error);
    return NextResponse.json(
      { error: "获取考试结果列表失败" },
      { status: 500 }
    );
  }
}
