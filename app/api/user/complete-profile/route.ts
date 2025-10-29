import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * 完善用户个人信息（姓名和手机号）
 */
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
    const { fullName, phone } = body;

    // 3. 验证参数
    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "姓名和手机号不能为空" },
        { status: 400 }
      );
    }

    // 验证姓名长度
    if (fullName.trim().length < 2) {
      return NextResponse.json(
        { error: "姓名至少需要2个字符" },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone.trim())) {
      return NextResponse.json(
        { error: "请输入有效的手机号码" },
        { status: 400 }
      );
    }

    // 4. 检查手机号是否已被使用（应用层检查）
    // 注意：数据库已有UNIQUE约束作为最终保障
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, phone.trim()))
      .limit(1);

    if (existingUsers.length > 0 && existingUsers[0].authUserId !== user.id) {
      return NextResponse.json(
        { error: "该手机号已被其他用户使用" },
        { status: 400 }
      );
    }

    // 5. 获取或创建用户记录
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    try {
      if (dbUsers.length === 0) {
        // 用户记录不存在，创建新用户
        await db.insert(usersTable).values({
          authUserId: user.id,
          email: user.email || "",
          fullName: fullName.trim(),
          phone: phone.trim(),
          profileCompleted: true,
          role: "candidate",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`为用户 ${user.id} 创建新记录并完成个人信息填写`);
      } else {
        // 用户记录存在，更新信息
        await db
          .update(usersTable)
          .set({
            fullName: fullName.trim(),
            phone: phone.trim(),
            profileCompleted: true,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.authUserId, user.id));
        console.log(`用户 ${user.id} 更新个人信息`);
      }
    } catch (dbError) {
      // 捕获数据库UNIQUE约束违反错误
      const errorMessage = dbError instanceof Error ? dbError.message : "";
      if (errorMessage.includes("unique") || errorMessage.includes("duplicate")) {
        return NextResponse.json(
          { error: "该手机号已被其他用户使用" },
          { status: 400 }
        );
      }
      throw dbError; // 其他数据库错误继续抛出
    }

    return NextResponse.json(
      {
        success: true,
        message: "个人信息保存成功",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("保存个人信息失败：", error);
    return NextResponse.json(
      { error: "保存个人信息失败" },
      { status: 500 }
    );
  }
}
