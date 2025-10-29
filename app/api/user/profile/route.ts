import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * 获取当前用户的个人信息
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

    // 2. 获取数据库用户信息
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    if (dbUsers.length === 0) {
      // 用户尚未创建DB记录，返回空信息
      return NextResponse.json(
        {
          email: user.email || "",
          fullName: null,
          phone: null,
          profileCompleted: false,
        },
        { status: 200 }
      );
    }

    const dbUser = dbUsers[0];

    return NextResponse.json(
      {
        email: dbUser.email,
        fullName: dbUser.fullName,
        phone: dbUser.phone,
        profileCompleted: dbUser.profileCompleted,
        role: dbUser.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("获取用户信息失败：", error);
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
  }
}
