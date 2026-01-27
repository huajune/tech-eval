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

    if (!role) {
      return NextResponse.json(
        { error: "缺少必要参数：role" },
        { status: 400 }
      );
    }

    // 测试岗位不需要language参数
    if (role !== "tester" && !language) {
      return NextResponse.json(
        { error: "缺少必要参数：language" },
        { status: 400 }
      );
    }

    // 3. 检查是否已有进行中的会话，如果有则自动终止
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
      // 自动终止之前的考试
      const oldSession = existingSessions[0].exam_sessions;
      await db
        .update(examSessionsTable)
        .set({
          status: "terminated",
          endTime: new Date(),
        })
        .where(eq(examSessionsTable.id, oldSession.id));

      console.log(
        `自动终止用户 ${user.id} 的旧考试会话: ${oldSession.id}`
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
    // 测试岗位：只按role和isActive查询
    // 其他岗位：按role、language、isActive查询，framework可选
    let whereConditions = [
      eq(examsTable.role, role),
      eq(examsTable.isActive, true),
    ];

    if (role !== "tester") {
      // 非测试岗位需要language
      whereConditions.push(eq(examsTable.language, language));
      // 如果提供了framework且不为空字符串，则添加到查询条件中
      if (framework && framework.trim() !== "") {
        whereConditions.push(eq(examsTable.framework, framework));
      }
    }

    let exams = await db
      .select()
      .from(examsTable)
      .where(and(...whereConditions))
      .limit(1);

    // 如果精确匹配找不到，且提供了framework，尝试不匹配framework（回退策略）
    if (exams.length === 0 && role !== "tester" && framework && framework.trim() !== "") {
      const fallbackConditions = [
        eq(examsTable.role, role),
        eq(examsTable.language, language),
        eq(examsTable.isActive, true),
      ];
      
      exams = await db
        .select()
        .from(examsTable)
        .where(and(...fallbackConditions))
        .limit(1);
      
      if (exams.length > 0) {
        console.warn(`未找到精确匹配的模板（framework: ${framework}），使用回退策略找到模板: ${exams[0].id}`);
      }
    }

    if (exams.length === 0) {
      // 添加更详细的错误信息用于调试
      const debugInfo = {
        role,
        language: role !== "tester" ? language : undefined,
        framework: role !== "tester" && framework && framework.trim() !== "" ? framework : undefined,
      };
      console.error("未找到匹配的考试模板:", debugInfo);
      
      return NextResponse.json(
        { 
          error: "未找到匹配的考试模板，请确保已运行数据库种子数据（pnpm db:seed）",
          debug: debugInfo 
        },
        { status: 404 }
      );
    }

    const exam = exams[0];

    // 6. 生成题目（调用题目选择算法）
    // 测试岗位只传递role，其他岗位传递role、language、framework
    const examConfig = role === "tester"
      ? { role }
      : { role, language, framework };
    const questions = await generateExamQuestions(examConfig);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "生成题目失败，请稍后重试" },
        { status: 500 }
      );
    }

    // 验证题目数量是否符合模板要求
    if (questions.length !== exam.totalQuestions) {
      console.warn(
        `题目数量不匹配：期望${exam.totalQuestions}题，实际生成${questions.length}题`
      );
    }

    // 7. 创建考试会话（使用模板配置）
    const durationSeconds = exam.durationMinutes * 60;
    const sessions = await db
      .insert(examSessionsTable)
      .values({
        userId: dbUser.id,
        examId: exam.id,
        status: "in_progress",
        selectedQuestions: questions.map((q) => q.id),
        startTime: new Date(),
        remainingSeconds: durationSeconds,
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
        durationMinutes: exam.durationMinutes,
        remainingSeconds: durationSeconds,
        questions: sanitizedQuestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("创建考试会话失败：", error);
    const errorMessage = error instanceof Error ? error.message : "创建考试会话失败";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
