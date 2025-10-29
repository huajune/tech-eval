import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { examSessionsTable, usersTable, examsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * 检查当前用户是否有进行中的考试
 */
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

    // 2. 获取数据库用户
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    if (dbUsers.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const dbUser = dbUsers[0];

    // 3. 查找进行中的考试会话
    const inProgressSessions = await db
      .select({
        session: examSessionsTable,
        exam: examsTable,
      })
      .from(examSessionsTable)
      .innerJoin(examsTable, eq(examSessionsTable.examId, examsTable.id))
      .where(
        and(
          eq(examSessionsTable.userId, dbUser.id),
          eq(examSessionsTable.status, "in_progress")
        )
      )
      .limit(1);

    if (inProgressSessions.length === 0) {
      return NextResponse.json(
        {
          hasInProgress: false,
        },
        { status: 200 }
      );
    }

    const { session, exam } = inProgressSessions[0];

    // 4. 检查考试是否已超时
    const now = new Date();
    const startTime = new Date(session.startTime);
    const durationMs = exam.durationMinutes * 60 * 1000;
    const expectedEndTime = new Date(startTime.getTime() + durationMs);

    if (now > expectedEndTime) {
      // 考试已超时，自动标记为terminated
      await db
        .update(examSessionsTable)
        .set({
          status: "terminated",
          endTime: expectedEndTime,
        })
        .where(eq(examSessionsTable.id, session.id));

      return NextResponse.json(
        {
          hasInProgress: false,
          message: "上一次考试已超时",
        },
        { status: 200 }
      );
    }

    // 5. 返回进行中的考试信息
    return NextResponse.json(
      {
        hasInProgress: true,
        sessionId: session.id,
        examName: exam.name,
        startTime: session.startTime,
        remainingSeconds: session.remainingSeconds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("检查进行中的考试失败：", error);
    return NextResponse.json(
      { error: "检查进行中的考试失败" },
      { status: 500 }
    );
  }
}
