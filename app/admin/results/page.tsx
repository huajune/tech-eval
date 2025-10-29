"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExamResult {
  resultId: string;
  sessionId: string;
  userId: string;
  userEmail: string;
  userName: string;
  examName: string;
  examRole: string;
  examLanguage: string;
  examFramework: string | null;
  totalScore: number;
  abilityScores: {
    code_design: number;
    architecture: number;
    database: number;
    devops: number;
  };
  estimatedLevel: string;
  passStatus: boolean;
  completedAt: string;
  timeTakenMinutes: number;
  sessionStatus: string;
  cheatingWarnings: number;
}

const levelColors: Record<string, string> = {
  P9: "bg-purple-500 text-white",
  P8: "bg-blue-500 text-white",
  P7: "bg-green-500 text-white",
  P6: "bg-yellow-600 text-white",
  P5: "bg-gray-500 text-white",
};

const roleLabels: Record<string, string> = {
  frontend: "前端",
  backend: "后端",
  fullstack: "全栈",
};

export default function AdminResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pass" | "fail">(
    "all"
  );

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch("/api/admin/results");

        if (!response.ok) {
          const error = await response.json();
          if (response.status === 403) {
            alert("权限不足，仅管理员可访问");
            router.push("/");
            return;
          }
          throw new Error(error.error || "获取结果列表失败");
        }

        const data = await response.json();
        setResults(data.results);
        setLoading(false);
      } catch (error) {
        alert(error instanceof Error ? error.message : "获取结果列表失败");
        router.push("/");
      }
    }

    fetchResults();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  const filteredResults = results.filter((result) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "pass") return result.passStatus;
    if (filterStatus === "fail") return !result.passStatus;
    return true;
  });

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">考试结果管理</h1>
            <p className="text-muted-foreground mt-1">
              查看所有应聘者的考试成绩和评级
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/grading">评分管理</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>总考试人数</CardDescription>
              <CardTitle className="text-3xl">{results.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>通过人数</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {results.filter((r) => r.passStatus).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>未通过人数</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {results.filter((r) => !r.passStatus).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>平均分</CardDescription>
              <CardTitle className="text-3xl">
                {results.length > 0
                  ? Math.round(
                      results.reduce((sum, r) => sum + r.totalScore, 0) /
                        results.length
                    )
                  : 0}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            全部 ({results.length})
          </Button>
          <Button
            variant={filterStatus === "pass" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pass")}
          >
            通过 ({results.filter((r) => r.passStatus).length})
          </Button>
          <Button
            variant={filterStatus === "fail" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("fail")}
          >
            未通过 ({results.filter((r) => !r.passStatus).length})
          </Button>
        </div>

        {/* Results list */}
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              暂无考试结果
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <Card key={result.resultId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {result.userName}
                        </CardTitle>
                        <Badge variant="outline">{result.userEmail}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <span>{result.examName}</span>
                        <span>•</span>
                        <span>
                          {roleLabels[result.examRole]} / {result.examLanguage}
                          {result.examFramework && ` / ${result.examFramework}`}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(levelColors[result.estimatedLevel])}
                        >
                          {result.estimatedLevel}
                        </Badge>
                        {result.passStatus ? (
                          <Badge className="bg-green-500 text-white">
                            通过
                          </Badge>
                        ) : (
                          <Badge variant="destructive">未通过</Badge>
                        )}
                      </div>
                      {result.cheatingWarnings > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          ⚠️ {result.cheatingWarnings} 次警告
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">总分</p>
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          getScoreColor(result.totalScore)
                        )}
                      >
                        {result.totalScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">代码设计</p>
                      <p className="text-lg font-semibold">
                        {result.abilityScores.code_design}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">软件架构</p>
                      <p className="text-lg font-semibold">
                        {result.abilityScores.architecture}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">数据库</p>
                      <p className="text-lg font-semibold">
                        {result.abilityScores.database}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">运维</p>
                      <p className="text-lg font-semibold">
                        {result.abilityScores.devops}
                      </p>
                    </div>
                    <div className="flex items-end justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/exam/${result.sessionId}/answers`}>
                          查看详情
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    完成时间：
                    {new Date(result.completedAt).toLocaleString("zh-CN")} | 用时：
                    {result.timeTakenMinutes} 分钟
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
