"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAntiCheat } from "@/hooks/use-anti-cheat";

interface Question {
  id: string;
  content: string;
  type: "single" | "multiple" | "essay";
  options?: Record<string, string>;
  abilityDimension: string;
  userAnswer: string[] | null;
}

interface SessionData {
  sessionId: string;
  status: string;
  startTime: string;
  remainingSeconds: number;
  durationMinutes: number;
  questions: Question[];
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [saving, setSaving] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Debounce timer for essay questions
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<{ questionId: string; answer: string[] } | null>(null);

  // Anti-cheat monitoring
  const { warningCount } = useAntiCheat({
    sessionId,
    idleTimeoutSeconds: 300, // 5 minutes
  });

  // Fetch session data
  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch(`/api/exam/session/${sessionId}`);
        if (!response.ok) {
          const error = await response.json();
          if (error.redirectUrl) {
            router.push(error.redirectUrl);
            return;
          }
          throw new Error(error.error || "获取考试数据失败");
        }

        const data: SessionData = await response.json();
        setSessionData(data);
        setRemainingSeconds(data.remainingSeconds);

        // Initialize answers from existing data
        const answersMap = new Map<string, string[]>();
        data.questions.forEach((q) => {
          if (q.userAnswer) {
            answersMap.set(q.id, q.userAnswer);
          }
        });
        setAnswers(answersMap);
        setLoading(false);
      } catch (error) {
        alert(error instanceof Error ? error.message : "获取考试数据失败");
        router.push("/");
      }
    }

    fetchSession();
  }, [sessionId, router]);

  // Server-side heartbeat (每30秒同步一次服务端时间)
  useEffect(() => {
    if (!sessionData) return;

    const heartbeat = async () => {
      try {
        const response = await fetch("/api/exam/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const error = await response.json();

          // 时间到自动提交
          if (error.shouldAutoSubmit) {
            alert("考试时间已到，系统已自动提交！");
            router.push(`/exam/${sessionId}/result`);
            return;
          }

          // 考试已终止
          if (error.shouldTerminate) {
            alert("考试已被终止（疑似作弊）");
            router.push("/");
            return;
          }

          throw new Error(error.error || "心跳检测失败");
        }

        const data = await response.json();

        // 更新剩余时间
        setRemainingSeconds(data.remainingSeconds);

        // 如果服务端返回应该自动提交
        if (data.shouldAutoSubmit) {
          alert("考试时间已到，系统已自动提交！");
          router.push(`/exam/${sessionId}/result`);
        }
      } catch (error) {
        console.error("心跳检测失败：", error);
      }
    };

    // 立即执行一次
    heartbeat();

    // 每30秒执行一次心跳
    const heartbeatInterval = setInterval(heartbeat, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [sessionData, sessionId, router]);

  // Client-side countdown (仅用于UI显示，真实时间由服务端控制)
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Save answer to backend
  const saveAnswer = useCallback(async (questionId: string, answer: string[]) => {
    setSaving(true);
    try {
      const response = await fetch("/api/exam/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId,
          userAnswer: answer,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "保存答案失败");
      }

      // 不需要再更新本地状态，已在handleAnswerChange中更新
    } catch (error) {
      console.error("保存答案失败：", error);
      alert(error instanceof Error ? error.message : "保存答案失败");
    } finally {
      setSaving(false);
    }
  }, [sessionId]);

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string[], isEssay = false) => {
    // 立即更新本地状态（提升用户体验）
    setAnswers((prev) => new Map(prev).set(questionId, answer));

    if (isEssay) {
      // 简答题：使用防抖，1秒后保存
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 记录pending save
      pendingSaveRef.current = { questionId, answer };

      debounceTimerRef.current = setTimeout(() => {
        saveAnswer(questionId, answer);
        pendingSaveRef.current = null;
      }, 1000); // 1秒防抖
    } else {
      // 选择题：立即保存
      saveAnswer(questionId, answer);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Flush pending saves before navigation or submit
  const flushPendingSaves = useCallback(async () => {
    // 清除防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // 递归保存所有pending，直到没有新的pending为止
    while (pendingSaveRef.current) {
      // 先拷贝当前pending引用（避免在保存期间被覆盖）
      const pending = pendingSaveRef.current;
      // 立即清空，让新的输入可以设置新的pending
      pendingSaveRef.current = null;
      // 等待当前pending保存完成
      await saveAnswer(pending.questionId, pending.answer);
      // 循环检查是否在保存期间又有新的pending（用户继续输入）
    }
  }, [saveAnswer]);

  // Submit exam
  const handleSubmit = async (isAutoSubmit = false) => {
    // 手动提交时需要确认，自动提交时不需要
    if (
      !isAutoSubmit &&
      !confirm(
        "确定要提交考试吗？提交后将无法修改答案。\n\n请确保所有题目都已作答。"
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      // 确保所有pending的保存都完成（必须等待）
      await flushPendingSaves();

      const response = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "提交考试失败");
      }

      const data = await response.json();
      router.push(data.redirectUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : "提交考试失败");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!sessionData) {
    return null;
  }

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const answeredCount = answers.size;
  const totalCount = sessionData.questions.length;
  const isTimeWarning = remainingSeconds < 120; // Last 2 minutes

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - Question area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Timer and progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    技术能力评估考试
                  </CardTitle>
                  <CardDescription>
                    已答 {answeredCount} / {totalCount} 题
                    {warningCount > 0 && (
                      <span className="ml-3 text-orange-600 font-semibold">
                        ⚠️ 警告: {warningCount}/3
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div
                  className={cn(
                    "text-2xl font-mono font-bold",
                    isTimeWarning ? "text-red-500" : "text-foreground"
                  )}
                >
                  {formatTime(remainingSeconds)}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Time warning */}
          {isTimeWarning && remainingSeconds > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                ⚠️ 剩余时间不足2分钟！请尽快完成答题并提交。
              </AlertDescription>
            </Alert>
          )}

          {/* Question card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-base font-normal text-muted-foreground">
                    第 {currentQuestionIndex + 1} 题 /{" "}
                    {currentQuestion.type === "single" && "单选题"}
                    {currentQuestion.type === "multiple" && "多选题"}
                    {currentQuestion.type === "essay" && "简答题"}
                  </CardTitle>
                  <CardDescription className="mt-4 text-base text-foreground whitespace-pre-wrap">
                    {currentQuestion.content}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Single choice */}
              {currentQuestion.type === "single" && currentQuestion.options && (
                <RadioGroup
                  value={answers.get(currentQuestion.id)?.[0] || ""}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, [value])
                  }
                >
                  {Object.entries(currentQuestion.options).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-start space-x-3 p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                      >
                        <RadioGroupItem value={key} id={`option-${key}`} />
                        <Label
                          htmlFor={`option-${key}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          <span className="font-semibold">{key}. </span>
                          {value}
                        </Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              )}

              {/* Multiple choice */}
              {currentQuestion.type === "multiple" &&
                currentQuestion.options && (
                  <div className="space-y-3">
                    {Object.entries(currentQuestion.options).map(
                      ([key, value]) => {
                        const isChecked =
                          answers.get(currentQuestion.id)?.includes(key) ||
                          false;

                        return (
                          <div
                            key={key}
                            className="flex items-start space-x-3 p-3 border rounded-md hover:bg-accent/50"
                          >
                            <Checkbox
                              id={`option-${key}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const current =
                                  answers.get(currentQuestion.id) || [];
                                const newAnswer = checked
                                  ? [...current, key]
                                  : current.filter((k) => k !== key);
                                handleAnswerChange(
                                  currentQuestion.id,
                                  newAnswer
                                );
                              }}
                            />
                            <Label
                              htmlFor={`option-${key}`}
                              className="flex-1 cursor-pointer font-normal"
                            >
                              <span className="font-semibold">{key}. </span>
                              {value}
                            </Label>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

              {/* Essay question */}
              {currentQuestion.type === "essay" && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="请输入你的答案（不超过150字）"
                    rows={6}
                    maxLength={150}
                    value={answers.get(currentQuestion.id)?.[0] || ""}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion.id, [e.target.value], true)
                    }
                    onPaste={(e) => e.preventDefault()}
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {answers.get(currentQuestion.id)?.[0]?.length || 0} / 150
                    字
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                >
                  上一题
                </Button>

                {saving && (
                  <span className="text-sm text-muted-foreground">
                    保存中...
                  </span>
                )}

                {currentQuestionIndex === sessionData.questions.length - 1 ? (
                  <Button onClick={() => handleSubmit(false)} disabled={submitting}>
                    {submitting ? "提交中..." : "提交考试"}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(sessionData.questions.length - 1, prev + 1)
                      )
                    }
                  >
                    下一题
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Question navigation */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="text-base">答题卡</CardTitle>
              <CardDescription>点击题号快速跳转</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {sessionData.questions.map((question, index) => {
                  const isAnswered = answers.has(question.id);
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <Button
                      key={question.id}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-10 w-10 p-0",
                        isAnswered && !isCurrent && "bg-green-50 border-green-300 text-green-700 hover:bg-green-100",
                        isAnswered && !isCurrent && "dark:bg-green-950 dark:border-green-700 dark:text-green-400"
                      )}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-primary bg-primary"></div>
                  <span>当前题目</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2 border-green-300 bg-green-50"></div>
                  <span>已答题目</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border-2"></div>
                  <span>未答题目</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
