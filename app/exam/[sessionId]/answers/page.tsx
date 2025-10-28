"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuestionAnswer {
  questionNumber: number;
  questionId: string;
  content: string;
  type: "single" | "multiple" | "essay";
  options?: Record<string, string>;
  abilityDimension: string;
  difficulty: string;
  userAnswer: string[];
  correctAnswer: string[] | null;
  isCorrect: boolean | null;
  manualScore: number | null;
  explanation: string | null;
  referenceAnswer: string | null;
}

interface AnswersData {
  sessionId: string;
  answers: QuestionAnswer[];
}

const abilityLabels: Record<string, string> = {
  code_design: "代码设计",
  architecture: "软件架构",
  database: "数据库建模",
  devops: "运维能力",
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
  easy: { label: "简单", color: "bg-green-100 text-green-700" },
  medium: { label: "中等", color: "bg-yellow-100 text-yellow-700" },
  hard: { label: "困难", color: "bg-red-100 text-red-700" },
};

export default function AnswersPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnswersData | null>(null);

  useEffect(() => {
    async function fetchAnswers() {
      try {
        const response = await fetch(`/api/exam/answers/${sessionId}`);
        if (!response.ok) {
          const error = await response.json();
          if (error.redirectUrl) {
            router.push(error.redirectUrl);
            return;
          }
          throw new Error(error.error || "获取答案失败");
        }

        const result: AnswersData = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        alert(error instanceof Error ? error.message : "获取答案失败");
        router.push("/");
      }
    }

    fetchAnswers();
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const correctCount = data.answers.filter((a) => a.isCorrect === true).length;
  const totalCount = data.answers.length;

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">答案解析</h1>
            <p className="text-muted-foreground mt-1">
              正确：{correctCount} / {totalCount} 题
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/exam/${sessionId}/result`}>返回结果</Link>
          </Button>
        </div>

        {/* Questions and answers */}
        <div className="space-y-6">
          {data.answers.map((qa) => {
            const isCorrect = qa.isCorrect === true;
            const isWrong = qa.isCorrect === false;
            const isPending = qa.isCorrect === null;

            return (
              <Card
                key={qa.questionId}
                className={cn(
                  isCorrect && "border-green-300",
                  isWrong && "border-red-300"
                )}
              >
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          第 {qa.questionNumber} 题
                        </span>
                        <Badge variant="outline">
                          {qa.type === "single" && "单选题"}
                          {qa.type === "multiple" && "多选题"}
                          {qa.type === "essay" && "简答题"}
                        </Badge>
                        <Badge
                          className={
                            difficultyLabels[qa.difficulty]?.color || ""
                          }
                        >
                          {difficultyLabels[qa.difficulty]?.label ||
                            qa.difficulty}
                        </Badge>
                        <Badge variant="secondary">
                          {abilityLabels[qa.abilityDimension]}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-normal whitespace-pre-wrap">
                        {qa.content}
                      </CardTitle>
                    </div>
                    <div>
                      {isCorrect && (
                        <Badge className="bg-green-500">✓ 正确</Badge>
                      )}
                      {isWrong && <Badge className="bg-red-500">✗ 错误</Badge>}
                      {isPending && (
                        <Badge variant="secondary">待评分</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Options (for choice questions) */}
                  {qa.options && (
                    <div className="space-y-2">
                      {Object.entries(qa.options).map(([key, value]) => {
                        const isUserAnswer = qa.userAnswer?.includes(key);
                        const isCorrectOption = qa.correctAnswer?.includes(key);

                        return (
                          <div
                            key={key}
                            className={cn(
                              "p-3 border rounded-md",
                              isUserAnswer && isCorrectOption && "bg-green-50 border-green-300",
                              isUserAnswer && !isCorrectOption && "bg-red-50 border-red-300",
                              !isUserAnswer && isCorrectOption && "bg-blue-50 border-blue-300"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-semibold">{key}.</span>
                              <span className="flex-1">{value}</span>
                              {isUserAnswer && (
                                <Badge variant="outline" className="ml-2">
                                  你的答案
                                </Badge>
                              )}
                              {isCorrectOption && !isUserAnswer && (
                                <Badge className="bg-blue-500 ml-2">
                                  正确答案
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Essay answer */}
                  {qa.type === "essay" && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold mb-2">你的答案：</p>
                        <div className="p-3 bg-gray-50 border rounded-md whitespace-pre-wrap">
                          {qa.userAnswer?.[0] || "（未作答）"}
                        </div>
                      </div>
                      {qa.referenceAnswer && (
                        <div>
                          <p className="text-sm font-semibold mb-2">
                            参考答案：
                          </p>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md whitespace-pre-wrap">
                            {qa.referenceAnswer}
                          </div>
                        </div>
                      )}
                      {qa.manualScore !== null && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <span className="text-sm font-semibold">
                            人工评分：
                          </span>
                          <Badge className="bg-purple-500">
                            {qa.manualScore} / 5 分
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation */}
                  {qa.explanation && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-semibold mb-2">📖 解析：</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {qa.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom action */}
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild variant="outline" size="lg">
            <Link href={`/exam/${sessionId}/result`}>查看结果</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
