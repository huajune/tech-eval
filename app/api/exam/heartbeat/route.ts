import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { examSessionsTable, examsTable, usersTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { calculateExamResult } from "@/lib/exam/scoring";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

    // 2. 获取请求参数
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "缺少必要参数：sessionId" },
        { status: 400 }
      );
    }

    // 3. 获取数据库用户
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    if (dbUsers.length === 0) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const dbUser = dbUsers[0];

    // 4. 获取会话信息
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
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const session = sessions[0];

    // 5. 检查会话状态和警告次数
    if (session.status === "terminated") {
      return NextResponse.json(
        {
          error: "考试已终止",
          shouldTerminate: true,
        },
        { status: 403 }
      );
    }

    // 检查警告次数，达到3次强制终止
    const warnings = session.cheatingWarnings || 0;
    if (warnings >= 3 && session.status !== "terminated") {
      await db
        .update(examSessionsTable)
        .set({ status: "terminated", endTime: new Date() })
        .where(eq(examSessionsTable.id, sessionId));

      return NextResponse.json(
        {
          error: "考试已终止（tab切换超过3次）",
          shouldTerminate: true,
          warnings,
        },
        { status: 403 }
      );
    }

    if (session.status === "completed") {
      return NextResponse.json(
        {
          error: "考试已完成",
          shouldRedirect: `/exam/${sessionId}/result`,
        },
        { status: 400 }
      );
    }

    // 6. 获取考试模板以获取时长配置
    const exams = await db
      .select()
      .from(examsTable)
      .where(eq(examsTable.id, session.examId))
      .limit(1);

    if (exams.length === 0) {
      return NextResponse.json({ error: "考试模板不存在" }, { status: 404 });
    }

    const exam = exams[0];

    // 7. 计算剩余时间（使用模板配置）
    const startTime = new Date(session.startTime);
    const now = new Date();
    const elapsedMs = now.getTime() - startTime.getTime();
    const maxDurationMs = exam.durationMinutes * 60 * 1000;
    const remainingMs = Math.max(0, maxDurationMs - elapsedMs);
    const remainingSeconds = Math.floor(remainingMs / 1000);

    // 8. 时间到自动提交
    if (remainingSeconds <= 0) {
      // 自动提交考试
      await db
        .update(examSessionsTable)
        .set({
          status: "completed",
          endTime: new Date(),
        })
        .where(eq(examSessionsTable.id, sessionId));

      // 触发自动评分（关键：避免结果页404）
      try {
        await calculateExamResult(sessionId);
        console.log(`会话 ${sessionId} 时间到自动提交并评分完成`);
      } catch (error) {
        console.error(`自动评分失败（会话 ${sessionId}）:`, error);
      }

      return NextResponse.json(
        {
          remainingSeconds: 0,
          shouldAutoSubmit: true,
          message: "时间已到，考试已自动提交",
        },
        { status: 200 }
      );
    }

    // 9. 返回剩余时间
    return NextResponse.json(
      {
        remainingSeconds,
        status: session.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("心跳检测失败：", error);
    return NextResponse.json({ error: "心跳检测失败" }, { status: 500 });
  }
}
