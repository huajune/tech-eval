"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExamResult {
  sessionId: string;
  examName: string;
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
}

const abilityLabels: Record<string, string> = {
  code_design: "代码设计",
  architecture: "软件架构",
  database: "数据库建模",
  devops: "运维能力",
};

const levelColors: Record<string, string> = {
  P9: "bg-purple-500",
  P8: "bg-blue-500",
  P7: "bg-green-500",
  P6: "bg-yellow-500",
  P5: "bg-gray-500",
};

const levelDescriptions: Record<string, string> = {
  P9: "资深专家 - 行业顶尖水平",
  P8: "高级专家 - 技术领导力突出",
  P7: "技术专家 - 独当一面",
  P6: "高级工程师 - 技术熟练",
  P5: "工程师 - 基础扎实",
};

export default function ExamResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const response = await fetch(`/api/exam/result/${sessionId}`);
        if (!response.ok) {
          const error = await response.json();
          if (error.redirectUrl) {
            router.push(error.redirectUrl);
            return;
          }
          throw new Error(error.error || "获取结果失败");
        }

        const data: ExamResult = await response.json();
        setResult(data);
        setLoading(false);
      } catch (error) {
        alert(error instanceof Error ? error.message : "获取结果失败");
        router.push("/");
      }
    }

    fetchResult();
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">考试结果报告</h1>
          <p className="text-muted-foreground">{result.examName}</p>
        </div>

        {/* Overall result card */}
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl mb-2">综合评估</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pass/Fail status */}
            <div className="text-center">
              {result.passStatus ? (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border-2 border-green-300 rounded-lg">
                  <span className="text-3xl">✅</span>
                  <span className="text-xl font-bold text-green-700">
                    通过考试
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 border-2 border-red-300 rounded-lg">
                  <span className="text-3xl">❌</span>
                  <span className="text-xl font-bold text-red-700">
                    未通过考试
                  </span>
                </div>
              )}
            </div>

            {/* Total score */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">总分</p>
              <p
                className={cn(
                  "text-6xl font-bold",
                  getScoreColor(result.totalScore)
                )}
              >
                {result.totalScore}
              </p>
              <p className="text-sm text-muted-foreground">满分 100 分</p>
            </div>

            {/* Estimated level */}
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">预估职级</p>
              <div className="flex justify-center">
                <Badge
                  className={cn(
                    levelColors[result.estimatedLevel],
                    "text-white text-2xl px-6 py-2"
                  )}
                >
                  {result.estimatedLevel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {levelDescriptions[result.estimatedLevel]}
              </p>
            </div>

            {/* Time taken */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                用时：{result.timeTakenMinutes} 分钟 / 完成时间：
                {new Date(result.completedAt).toLocaleString("zh-CN")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ability scores breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>能力维度评分</CardTitle>
            <CardDescription>各项技术能力的详细得分</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(result.abilityScores).map(([key, score]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{abilityLabels[key]}</span>
                  <span
                    className={cn("text-xl font-bold", getScoreColor(score))}
                  >
                    {score}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      getScoreBarColor(score)
                    )}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Score interpretation */}
        <Card>
          <CardHeader>
            <CardTitle>评分说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-1">职级对应分数:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• P9: 91-100 分</li>
                  <li>• P8: 76-90 分</li>
                  <li>• P7: 61-75 分</li>
                  <li>• P6: 41-60 分</li>
                  <li>• P5: 0-40 分</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">能力维度权重:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 软件架构: 30%</li>
                  <li>• 代码设计: 25%</li>
                  <li>• 数据库建模: 25%</li>
                  <li>• 运维能力: 20%</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground pt-2 border-t">
              注意：简答题需要人工评分，评分完成后总分可能会有调整。
            </p>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline" size="lg">
            <Link href={`/exam/${sessionId}/answers`}>查看答案解析</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
