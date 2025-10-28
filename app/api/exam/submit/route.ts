import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { examSessionsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
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

    // 4. 验证会话（允许已完成的会话，实现幂等性）
    const sessions = await db
      .select()
      .from(examSessionsTable)
      .where(eq(examSessionsTable.id, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const session = sessions[0];

    // 检查会话归属
    if (session.userId !== dbUser.id) {
      return NextResponse.json({ error: "无权访问此会话" }, { status: 403 });
    }

    // 如果已经提交，直接返回成功（幂等性）
    if (session.status === "completed") {
      return NextResponse.json(
        {
          success: true,
          redirectUrl: `/exam/${sessionId}/result`,
        },
        { status: 200 }
      );
    }

    // 如果会话已终止，不能提交
    if (session.status === "terminated") {
      return NextResponse.json(
        { error: "考试已终止（疑似作弊）" },
        { status: 403 }
      );
    }

    // 5. 更新会话状态为已完成
    await db
      .update(examSessionsTable)
      .set({
        status: "completed",
        endTime: new Date(),
      })
      .where(eq(examSessionsTable.id, sessionId));

    // 6. 触发自动评分（选择题）
    const result = await calculateExamResult(sessionId);

    console.log("考试已提交，评分结果：", result);

    // 7. 返回结果
    return NextResponse.json(
      {
        success: true,
        redirectUrl: `/exam/${sessionId}/result`,
        result: {
          totalScore: result.totalScore,
          estimatedLevel: result.estimatedLevel,
          passStatus: result.passStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("提交考试失败：", error);
    return NextResponse.json({ error: "提交考试失败" }, { status: 500 });
  }
}
