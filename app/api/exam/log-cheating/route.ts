import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { cheatingLogsTable, usersTable, examSessionsTable } from "@/db/schema";
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
    const { sessionId, behaviorType, timestamp } = body;

    if (!sessionId || !behaviorType) {
      return NextResponse.json(
        { error: "缺少必要参数" },
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

    const session = sessions[0];

    // 5. Log the behavior (字段映射到schema)
    await db.insert(cheatingLogsTable).values({
      sessionId,
      eventType: behaviorType,
      metadata: { userId: dbUser.id },
      createdAt: timestamp ? new Date(timestamp) : new Date(),
    });

    // 6. 只有tab_switch才增加警告计数器（其他事件只记录）
    let currentWarnings = session.cheatingWarnings || 0;
    if (behaviorType === "tab_switch") {
      currentWarnings += 1;

      await db
        .update(examSessionsTable)
        .set({ cheatingWarnings: currentWarnings })
        .where(eq(examSessionsTable.id, sessionId));

      console.log(
        `会话 ${sessionId} tab_switch警告: ${currentWarnings}/3`
      );

      // 7. 达到3次警告，强制终止考试
      if (currentWarnings >= 3) {
        await db
          .update(examSessionsTable)
          .set({ status: "terminated", endTime: new Date() })
          .where(eq(examSessionsTable.id, sessionId));

        console.log(`会话 ${sessionId} 因tab_switch 3次被强制终止`);

        return NextResponse.json(
          {
            success: true,
            terminated: true,
            warnings: currentWarnings,
            message: "考试已终止（tab切换超过3次）",
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        warnings: currentWarnings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("记录作弊行为失败：", error);
    return NextResponse.json(
      { error: "记录作弊行为失败" },
      { status: 500 }
    );
  }
}
