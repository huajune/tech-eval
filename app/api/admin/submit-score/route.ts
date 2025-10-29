import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { answersTable, usersTable, questionsTable } from "@/db/schema";
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

    // 2. 验证管理员权限
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
        { error: "权限不足，仅限管理员访问" },
        { status: 403 }
      );
    }

    // 3. 获取请求参数
    const body = await request.json();
    const { answerId, score, sessionId } = body;

    // 4. 验证输入参数
    if (!answerId || score === undefined || !sessionId) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 5. 获取答案对应的题目，验证分数不超过权重
    const answerRecords = await db
      .select({
        answer: answersTable,
        question: questionsTable,
      })
      .from(answersTable)
      .innerJoin(questionsTable, eq(answersTable.questionId, questionsTable.id))
      .where(eq(answersTable.id, answerId))
      .limit(1);

    if (answerRecords.length === 0) {
      return NextResponse.json(
        { error: "答案记录不存在" },
        { status: 404 }
      );
    }

    const { question } = answerRecords[0];
    const maxScore = question.weight;

    if (score < 0 || score > maxScore) {
      return NextResponse.json(
        { error: `分数必须在0-${maxScore}之间` },
        { status: 400 }
      );
    }

    // 6. Update the answer with manual score
    await db
      .update(answersTable)
      .set({
        manualScore: score,
        gradedAt: new Date(),
      })
      .where(eq(answersTable.id, answerId));

    // 7. Recalculate exam result
    const result = await calculateExamResult(sessionId);

    console.log(`简答题已评分: ${answerId}, 分数: ${score}, 重新计算结果: `, result);

    return NextResponse.json(
      {
        success: true,
        newTotalScore: result.totalScore,
        newLevel: result.estimatedLevel,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("提交评分失败：", error);
    return NextResponse.json({ error: "提交评分失败" }, { status: 500 });
  }
}
