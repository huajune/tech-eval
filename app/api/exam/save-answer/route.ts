import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { answersTable, questionsTable, usersTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { validateExamSession } from "@/lib/exam/session";
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
    const { sessionId, questionId, userAnswer } = body;

    if (!sessionId || !questionId) {
      return NextResponse.json(
        { error: "缺少必要参数：sessionId, questionId" },
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

    // 4. 验证会话
    const validation = await validateExamSession(sessionId, dbUser.id);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    const session = validation.session!;

    // 5. 验证questionId是否属于本次考试的选定题目（防止作弊）
    const selectedQuestionIds = session.selectedQuestions as string[];
    if (!selectedQuestionIds.includes(questionId)) {
      return NextResponse.json(
        { error: "无效的题目ID，该题目不属于本次考试" },
        { status: 403 }
      );
    }

    // 6. 获取题目信息（用于判断答案是否正确）
    const questions = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.id, questionId))
      .limit(1);

    if (questions.length === 0) {
      return NextResponse.json({ error: "题目不存在" }, { status: 404 });
    }

    const question = questions[0];

    // 7. 验证简答题字数限制（150字）
    if (question.type === "essay" && typeof userAnswer === "string") {
      if (userAnswer.length > 150) {
        return NextResponse.json(
          { error: "简答题字数不能超过150字" },
          { status: 400 }
        );
      }
    }

    // 8. 自动判分（选择题）
    let isCorrect: boolean | null = null;
    if (question.type !== "essay") {
      // 比较答案
      const correctAnswer = question.correctAnswer as string[];
      const userAnswerArray = Array.isArray(userAnswer)
        ? userAnswer
        : [userAnswer];

      // 排序后比较
      const sortedCorrect = [...correctAnswer].sort();
      const sortedUser = [...userAnswerArray].sort();

      isCorrect =
        JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser);
    }

    // 9. 保存或更新答案（Upsert）
    const existingAnswers = await db
      .select()
      .from(answersTable)
      .where(
        and(
          eq(answersTable.sessionId, sessionId),
          eq(answersTable.questionId, questionId)
        )
      )
      .limit(1);

    if (existingAnswers.length > 0) {
      // 更新现有答案
      await db
        .update(answersTable)
        .set({
          userAnswer,
          isCorrect,
          updatedAt: new Date(),
        })
        .where(eq(answersTable.id, existingAnswers[0].id));
    } else {
      // 插入新答案
      await db.insert(answersTable).values({
        sessionId,
        questionId,
        userAnswer,
        isCorrect,
      });
    }

    return NextResponse.json(
      {
        success: true,
        isCorrect: question.type !== "essay" ? isCorrect : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("保存答案失败：", error);
    return NextResponse.json({ error: "保存答案失败" }, { status: 500 });
  }
}
