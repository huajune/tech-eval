import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { examSessionsTable, examsTable, usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { generateExamQuestions } from "@/lib/exam/exam-generator";
import { sanitizeQuestions } from "@/lib/exam/session";
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
    const { role, language, framework } = body;

    if (!role || !language) {
      return NextResponse.json(
        { error: "缺少必要参数：role, language" },
        { status: 400 }
      );
    }

    // 3. 检查是否已有进行中的会话
    const existingSessions = await db
      .select()
      .from(examSessionsTable)
      .innerJoin(usersTable, eq(examSessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(usersTable.authUserId, user.id),
          eq(examSessionsTable.status, "in_progress")
        )
      )
      .limit(1);

    if (existingSessions.length > 0) {
      return NextResponse.json(
        { error: "已有进行中的考试，请先完成" },
        { status: 409 }
      );
    }

    // 4. 获取或创建用户记录
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    let dbUser;
    if (dbUsers.length === 0) {
      // 创建新用户
      const newUsers = await db
        .insert(usersTable)
        .values({
          authUserId: user.id,
          email: user.email || "",
          fullName: user.user_metadata?.full_name || null,
        })
        .returning();
      dbUser = newUsers[0];
    } else {
      dbUser = dbUsers[0];
    }

    // 5. 查找对应的考试模板
    const exams = await db
      .select()
      .from(examsTable)
      .where(
        and(
          eq(examsTable.role, role),
          eq(examsTable.language, language),
          eq(examsTable.isActive, true)
        )
      )
      .limit(1);

    if (exams.length === 0) {
      return NextResponse.json(
        { error: "未找到匹配的考试模板" },
        { status: 404 }
      );
    }

    const exam = exams[0];

    // 6. 生成题目（调用题目选择算法）
    const questions = await generateExamQuestions({ role, language, framework });

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "生成题目失败，请稍后重试" },
        { status: 500 }
      );
    }

    // 7. 创建考试会话
    const sessions = await db
      .insert(examSessionsTable)
      .values({
        userId: dbUser.id,
        examId: exam.id,
        status: "in_progress",
        selectedQuestions: questions.map((q) => q.id),
        startTime: new Date(),
        remainingSeconds: 600,
        cheatingWarnings: 0,
      })
      .returning();

    const session = sessions[0];

    // 8. 返回脱敏后的题目
    const sanitizedQuestions = sanitizeQuestions(questions);

    return NextResponse.json(
      {
        sessionId: session.id,
        startTime: session.startTime,
        durationMinutes: 10,
        remainingSeconds: 600,
        questions: sanitizedQuestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("创建考试会话失败：", error);
    return NextResponse.json(
      { error: "创建考试会话失败" },
      { status: 500 }
    );
  }
}
