import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { InProgressExamAlert } from "@/components/in-progress-exam-alert";
import { DulidayLogo } from "@/components/duliday-logo";
import { hasEnvVars } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlayCircle, FileCheck, BarChart3, ClipboardList } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  // 获取当前用户信息
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  if (user) {
    let dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    // 如果用户不存在于数据库，自动创建默认记录
    if (dbUsers.length === 0) {
      try {
        const newUsers = await db
          .insert(usersTable)
          .values({
            authUserId: user.id,
            email: user.email || "",
            role: "candidate", // 默认为候选人角色
            profileCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        dbUsers = newUsers;
        console.log(`自动创建用户记录: ${user.email}`);
      } catch (error) {
        // 并发情况：如果是唯一约束冲突（其他请求已创建），重新查询
        const errorMessage = error instanceof Error ? error.message : "";
        if (errorMessage.includes("unique") || errorMessage.includes("duplicate")) {
          console.log(`用户记录已存在（并发创建），重新查询: ${user.email}`);
          dbUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.authUserId, user.id))
            .limit(1);
        } else {
          console.error("创建用户记录失败：", error);
        }
      }
    }

    if (dbUsers.length > 0) {
      userRole = dbUsers[0].role;
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-background to-muted/20">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white/95 dark:bg-background/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
          <div className="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-6 items-center font-semibold">
              <Link href={"/"} className="flex items-center hover:opacity-80 transition-opacity">
                <DulidayLogo size="sm" />
              </Link>
              <div className="flex items-center gap-3">
                {user && userRole === "candidate" && (
                  <Button asChild variant="default" size="sm" className="shadow-sm">
                    <Link href="/exam/setup">开始考试</Link>
                  </Button>
                )}
                {user && userRole === "admin" && (
                  <Button asChild variant="default" size="sm" className="shadow-sm">
                    <Link href="/admin/grading">管理后台</Link>
                  </Button>
                )}
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-16 max-w-6xl p-6 md:p-8 w-full">
          <Hero />

          {/* 检查是否有进行中的考试 */}
          {user && userRole === "candidate" && <InProgressExamAlert />}

          {/* 系统功能介绍 */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 w-full">
              {userRole === "candidate" && (
                <>
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover-lift group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <PlayCircle className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">开始考试</CardTitle>
                      </div>
                      <CardDescription>
                        选择您的应聘岗位和技术栈，开始技术能力评估
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2.5 text-muted-foreground mb-6">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>考试时长：10分钟</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>题目数量：15题（选择题和简答题）</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>考察维度：代码设计、软件架构、数据库建模、运维能力</span>
                        </li>
                      </ul>
                      <Button asChild className="w-full mt-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                        <Link href="/exam/setup">配置并开始</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover-lift group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <ClipboardList className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">考试规则</CardTitle>
                      </div>
                      <CardDescription>请仔细阅读考试注意事项</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2.5 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>考试过程中请保持专注，切勿切换标签页</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>系统会自动检测作弊行为并记录警告</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>超时未答的题目不计分</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>简答题需要人工评分，请耐心等待结果</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
              {userRole === "admin" && (
                <>
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover-lift group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <FileCheck className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">待评分管理</CardTitle>
                      </div>
                      <CardDescription>
                        查看和评分待处理的简答题
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2.5 text-muted-foreground mb-6">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>查看所有待评分的简答题</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>根据评分标准给出分数</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>评分后自动计算总分和能力评级</span>
                        </li>
                      </ul>
                      <Button asChild className="w-full mt-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                        <Link href="/admin/grading">前往评分</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover-lift group">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">考试结果查看</CardTitle>
                      </div>
                      <CardDescription>
                        查看所有应聘者的考试分数和评级
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2.5 text-muted-foreground mb-6">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>查看完整的考试成绩列表</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>查看各维度能力评分</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>查看系统推荐的能力评级</span>
                        </li>
                      </ul>
                      <Button asChild className="w-full mt-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]" variant="outline">
                        <Link href="/admin/results">查看成绩</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* 未登录提示 */}
          {!user && (
            <div className="w-full flex justify-center px-4">
              <Card className="shadow-lg border-0 max-w-2xl w-full">
                <CardHeader>
                  <CardTitle className="text-2xl">欢迎使用跃橙技术评估系统</CardTitle>
                  <CardDescription className="text-base">
                    请先登录以开始使用技术能力评估系统
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    应聘者登录后可以参加技术评估考试，管理员登录后可以评分和查看考试结果。
                  </p>
                  <Button asChild className="w-full shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                    <Link href="/auth/login">立即登录</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <footer className="w-full flex items-center justify-center border-t border-t-foreground/10 bg-muted/30 mt-16 text-center text-xs gap-8 py-12">
          <p className="text-muted-foreground">
            © 2025 跃橙灵工智能集团 - 技术能力评估系统
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
