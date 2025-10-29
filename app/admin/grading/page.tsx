"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface EssayAnswer {
  answerId: string;
  questionId: string;
  questionContent: string;
  userAnswer: string;
  referenceAnswer: string | null;
  explanation: string | null;
  abilityDimension: string;
  weight: number; // 题目权重（满分）
}

interface PendingSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  completedAt: Date | null;
  answers: EssayAnswer[];
}

const abilityLabels: Record<string, string> = {
  code_design: "代码设计",
  architecture: "软件架构",
  database: "数据库建模",
  devops: "运维能力",
};

export default function AdminGradingPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<PendingSession[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingGrading();
  }, []);

  const fetchPendingGrading = async () => {
    try {
      const response = await fetch("/api/admin/pending-grading");
      if (!response.ok) {
        throw new Error("获取待评分列表失败");
      }

      const data = await response.json();
      setSessions(data.pendingSessions);
      setLoading(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "获取待评分列表失败");
      setLoading(false);
    }
  };

  const handleScoreChange = (answerId: string, value: string, maxScore: number) => {
    const score = parseFloat(value);
    if (!isNaN(score) && score >= 0 && score <= maxScore) {
      setScores((prev) => ({ ...prev, [answerId]: score }));
    }
  };

  const handleSubmitScore = async (
    answerId: string,
    sessionId: string,
    score: number
  ) => {
    setSubmitting(answerId);
    try {
      const response = await fetch("/api/admin/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, score, sessionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "提交评分失败");
      }

      const result = await response.json();
      alert(
        `评分成功！\n新的总分: ${result.newTotalScore}\n新的职级: ${result.newLevel}`
      );

      // Refresh the list
      fetchPendingGrading();

      // Clear the score input
      setScores((prev) => {
        const newScores = { ...prev };
        delete newScores[answerId];
        return newScores;
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "提交评分失败");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">简答题评分</h1>
            <p className="text-muted-foreground mt-1">
              待评分：{sessions.length} 个考试会话
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>

        {/* Empty state */}
        {sessions.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无待评分的简答题
            </CardContent>
          </Card>
        )}

        {/* Pending sessions */}
        {sessions.map((session) => (
          <Card key={session.sessionId}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    考生：{session.userName || session.userEmail}
                  </CardTitle>
                  <CardDescription>
                    完成时间：
                    {session.completedAt
                      ? new Date(session.completedAt).toLocaleString("zh-CN")
                      : "未知"}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {session.answers.length} 道简答题待评
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {session.answers.map((answer, index) => (
                <div
                  key={answer.answerId}
                  className="p-4 border rounded-lg space-y-4"
                >
                  {/* Question info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          第 {index + 1} 题
                        </span>
                        <Badge variant="outline">简答题</Badge>
                        <Badge variant="secondary">
                          {abilityLabels[answer.abilityDimension]}
                        </Badge>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {answer.questionContent}
                      </p>
                    </div>
                  </div>

                  {/* User answer */}
                  <div>
                    <Label className="text-sm font-semibold">
                      考生答案：
                    </Label>
                    <div className="mt-1 p-3 bg-gray-50 border rounded-md text-sm whitespace-pre-wrap">
                      {answer.userAnswer || "（未作答）"}
                    </div>
                  </div>

                  {/* Reference answer */}
                  {answer.referenceAnswer && (
                    <div>
                      <Label className="text-sm font-semibold">
                        参考答案：
                      </Label>
                      <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm whitespace-pre-wrap">
                        {answer.referenceAnswer}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {answer.explanation && (
                    <div>
                      <Label className="text-sm font-semibold">
                        评分标准：
                      </Label>
                      <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm whitespace-pre-wrap">
                        {answer.explanation}
                      </div>
                    </div>
                  )}

                  {/* Score input */}
                  <div className="flex items-end gap-3 pt-3 border-t">
                    <div className="flex-1 max-w-xs">
                      <Label htmlFor={`score-${answer.answerId}`}>
                        评分（0-{answer.weight}分）
                      </Label>
                      <Input
                        id={`score-${answer.answerId}`}
                        type="number"
                        min="0"
                        max={answer.weight}
                        step="0.5"
                        value={scores[answer.answerId] ?? ""}
                        onChange={(e) =>
                          handleScoreChange(answer.answerId, e.target.value, answer.weight)
                        }
                        placeholder="输入分数"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        handleSubmitScore(
                          answer.answerId,
                          session.sessionId,
                          scores[answer.answerId] ?? 0
                        )
                      }
                      disabled={
                        scores[answer.answerId] === undefined ||
                        submitting === answer.answerId
                      }
                    >
                      {submitting === answer.answerId
                        ? "提交中..."
                        : "提交评分"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
