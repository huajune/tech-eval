"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ExamSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [framework, setFramework] = useState<string>("");

  const roleOptions = [
    { value: "frontend", label: "前端开发工程师" },
    { value: "backend", label: "后端开发工程师" },
    { value: "fullstack", label: "全栈工程师" },
  ];

  const languageOptions = [
    { value: "typescript", label: "TypeScript" },
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
  ];

  const getFrameworkOptions = () => {
    if (role === "frontend" && language === "typescript") {
      return [
        { value: "nextjs", label: "Next.js" },
        { value: "react", label: "React" },
      ];
    }
    if (role === "backend" && language === "java") {
      return [{ value: "spring", label: "Spring Boot" }];
    }
    if (role === "backend" && language === "python") {
      return [{ value: "django", label: "Django" }];
    }
    if (role === "backend" && language === "typescript") {
      return [{ value: "express", label: "Express.js" }];
    }
    return [];
  };

  const frameworkOptions = getFrameworkOptions();

  const handleSubmit = async () => {
    if (!role || !language) {
      alert("请选择角色和编程语言");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/exam/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, language, framework }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "创建考试会话失败");
      }

      const data = await response.json();
      // 跳转到答题页面
      router.push(`/exam/${data.sessionId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "创建考试会话失败");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">考试配置</CardTitle>
          <CardDescription>
            请根据您应聘的岗位选择对应的技术栈
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 角色选择 */}
          <div className="space-y-2">
            <Label>选择应聘岗位</Label>
            <div className="grid grid-cols-1 gap-2">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition ${
                    role === option.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setFramework("");
                    }}
                    className="h-4 w-4"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 语言选择 */}
          <div className="space-y-2">
            <Label>选择编程语言</Label>
            <div className="grid grid-cols-3 gap-2">
              {languageOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center space-x-2 p-3 border rounded-md cursor-pointer transition ${
                    language === option.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="language"
                    value={option.value}
                    checked={language === option.value}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      setFramework("");
                    }}
                    className="h-4 w-4"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 框架选择（如果有可选框架） */}
          {frameworkOptions.length > 0 && (
            <div className="space-y-2">
              <Label>选择框架</Label>
              <div className="grid grid-cols-2 gap-2">
                {frameworkOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center space-x-2 p-3 border rounded-md cursor-pointer transition ${
                      framework === option.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="framework"
                      value={option.value}
                      checked={framework === option.value}
                      onChange={(e) => setFramework(e.target.value)}
                      className="h-4 w-4"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 提交按钮 */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !role || !language}
            className="w-full"
            size="lg"
          >
            {loading ? "创建中..." : "开始考试"}
          </Button>

          {/* 考试说明 */}
          <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
            <p>• 考试时长：10分钟</p>
            <p>• 题目数量：20题（18道选择题 + 2道简答题）</p>
            <p>• 考察维度：代码设计、软件架构、数据库建模、运维能力</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
