import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { InProgressExamAlert } from "@/components/in-progress-exam-alert";
import { hasEnvVars } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    const dbUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.authUserId, user.id))
      .limit(1);

    if (dbUsers.length > 0) {
      userRole = dbUsers[0].role;
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>TechEval - 技术能力评估系统</Link>
              <div className="flex items-center gap-2">
                {user && userRole === "candidate" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/exam/setup">开始考试</Link>
                  </Button>
                )}
                {user && userRole === "admin" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/admin/grading">管理后台</Link>
                  </Button>
                )}
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-12 max-w-5xl p-5 w-full">
          <Hero />

          {/* 检查是否有进行中的考试 */}
          {user && userRole === "candidate" && <InProgressExamAlert />}

          {/* 系统功能介绍 */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
              {userRole === "candidate" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>开始考试</CardTitle>
                      <CardDescription>
                        选择您的应聘岗位和技术栈，开始技术能力评估
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• 考试时长：10分钟</li>
                        <li>• 题目数量：20题（18道选择题 + 2道简答题）</li>
                        <li>
                          • 考察维度：代码设计、软件架构、数据库建模、运维能力
                        </li>
                      </ul>
                      <Button asChild className="w-full mt-4">
                        <Link href="/exam/setup">配置并开始</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>考试规则</CardTitle>
                      <CardDescription>请仔细阅读考试注意事项</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• 考试过程中请保持专注，切勿切换标签页</li>
                        <li>• 系统会自动检测作弊行为并记录警告</li>
                        <li>• 超时未答的题目不计分</li>
                        <li>• 简答题需要人工评分，请耐心等待结果</li>
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
              {userRole === "admin" && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>待评分管理</CardTitle>
                      <CardDescription>
                        查看和评分待处理的简答题
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• 查看所有待评分的简答题</li>
                        <li>• 根据评分标准给出分数</li>
                        <li>• 评分后自动计算总分和能力评级</li>
                      </ul>
                      <Button asChild className="w-full mt-4">
                        <Link href="/admin/grading">前往评分</Link>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>考试结果查看</CardTitle>
                      <CardDescription>
                        查看所有应聘者的考试分数和评级
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• 查看完整的考试成绩列表</li>
                        <li>• 查看各维度能力评分</li>
                        <li>• 查看系统推荐的能力评级</li>
                      </ul>
                      <Button asChild className="w-full mt-4" variant="outline">
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
            <Card className="mx-4">
              <CardHeader>
                <CardTitle>欢迎使用 TechEval</CardTitle>
                <CardDescription>
                  请先登录以开始使用技术能力评估系统
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  应聘者登录后可以参加技术评估考试，管理员登录后可以评分和查看考试结果。
                </p>
                <Button asChild className="w-full">
                  <Link href="/auth/login">立即登录</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p className="text-muted-foreground">
            © 2025 TechEval - 技术能力评估系统
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
