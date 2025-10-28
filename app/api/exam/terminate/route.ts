import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { examSessionsTable, usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Verify user authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    // 2. Get request body
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "缺少必要参数：sessionId" },
        { status: 400 }
      );
    }

    // 3. Get database user
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    if (dbUsers.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const dbUser = dbUsers[0];

    // 4. Verify session ownership
    const sessions = await db
      .select()
      .from(examSessionsTable)
      .where(
        and(
          eq(examSessionsTable.id, sessionId),
          eq(examSessionsTable.userId, dbUser.id)
        )
      )
      .limit(1);

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: "会话不存在或无权访问" },
        { status: 403 }
      );
    }

    // 5. Terminate the session (set status to terminated)
    await db
      .update(examSessionsTable)
      .set({
        status: "terminated",
        endTime: new Date(),
      })
      .where(eq(examSessionsTable.id, sessionId));

    console.log(`考试会话 ${sessionId} 已被终止（疑似作弊）`);

    return NextResponse.json(
      {
        success: true,
        message: "考试已终止",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("终止考试失败：", error);
    return NextResponse.json({ error: "终止考试失败" }, { status: 500 });
  }
}
