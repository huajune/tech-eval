"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface InProgressExam {
  sessionId: string;
  examName: string;
  startTime: string;
  remainingSeconds: number;
}

export function InProgressExamAlert() {
  const router = useRouter();
  const [inProgressExam, setInProgressExam] = useState<InProgressExam | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInProgressExam();
  }, []);

  async function checkInProgressExam() {
    try {
      const response = await fetch("/api/exam/check-in-progress");
      if (response.ok) {
        const data = await response.json();
        if (data.hasInProgress) {
          setInProgressExam({
            sessionId: data.sessionId,
            examName: data.examName,
            startTime: data.startTime,
            remainingSeconds: data.remainingSeconds,
          });
        }
      }
    } catch (error) {
      console.error("检查进行中的考试失败：", error);
    } finally {
      setLoading(false);
    }
  }

  function formatRemainingTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  }

  if (loading || !inProgressExam) {
    return null;
  }

  return (
    <Alert className="border-orange-500 bg-orange-50">
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-semibold text-orange-900">
            ⚠️ 您有一场正在进行中的考试
          </p>
          <p className="text-sm text-orange-800 mt-1">
            考试：{inProgressExam.examName} | 剩余时间：
            {formatRemainingTime(inProgressExam.remainingSeconds)}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/exam/${inProgressExam.sessionId}`)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          继续考试
        </Button>
      </AlertDescription>
    </Alert>
  );
}
