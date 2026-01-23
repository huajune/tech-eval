"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ExamSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingInProgress, setCheckingInProgress] = useState(true);
  const [inProgressSession, setInProgressSession] = useState<{
    sessionId: string;
    examName: string;
  } | null>(null);
  const [role, setRole] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [framework, setFramework] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [profileCompleted, setProfileCompleted] = useState<boolean>(false);
  const [originalData, setOriginalData] = useState({
    fullName: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
  });

  useEffect(() => {
    checkInProgressExam();
    fetchUserProfile();
  }, []);

  async function checkInProgressExam() {
    try {
      const response = await fetch("/api/exam/check-in-progress");
      if (response.ok) {
        const data = await response.json();
        if (data.hasInProgress) {
          setInProgressSession({
            sessionId: data.sessionId,
            examName: data.examName,
          });
        }
      }
    } catch (error) {
      console.error("检查进行中的考试失败：", error);
    } finally {
      setCheckingInProgress(false);
    }
  }

  async function fetchUserProfile() {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        // 使用后端返回的 profileCompleted 字段，不要自己判断
        setProfileCompleted(data.profileCompleted || false);

        // 填充表单并保存原始值
        const fname = data.fullName || "";
        const ph = data.phone || "";
        setFullName(fname);
        setPhone(ph);
        setOriginalData({
          fullName: fname,
          phone: ph,
        });
      }
    } catch (error) {
      console.error("获取用户信息失败：", error);
    }
  }

  const roleOptions = [
    { value: "frontend", label: "前端开发工程师" },
    { value: "backend", label: "后端开发工程师" },
    { value: "fullstack", label: "全栈工程师" },
  ];

  // 根据角色动态获取可选语言
  const getLanguageOptions = () => {
    // 全栈工程师目前只支持TypeScript
    if (role === "fullstack") {
      return [{ value: "typescript", label: "TypeScript" }];
    }
    // 其他角色支持所有语言
    return [
      { value: "typescript", label: "TypeScript" },
      { value: "java", label: "Java" },
      { value: "python", label: "Python" },
    ];
  };

  const languageOptions = getLanguageOptions();

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
    if (role === "fullstack" && language === "typescript") {
      return [{ value: "nextjs", label: "Next.js" }];
    }
    return [];
  };

  const frameworkOptions = getFrameworkOptions();

  const validateForm = (): boolean => {
    const newErrors = {
      fullName: "",
      phone: "",
    };

    // 验证姓名
    if (!fullName.trim()) {
      newErrors.fullName = "请输入姓名";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "姓名至少需要2个字符";
    }

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone.trim()) {
      newErrors.phone = "请输入手机号";
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = "请输入有效的手机号码";
    }

    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.phone;
  };

  const handleSubmit = async () => {
    // 如果有进行中的考试，先确认
    if (inProgressSession) {
      const confirmed = confirm(
        `您有一场正在进行中的考试（${inProgressSession.examName}）。\n\n创建新考试将自动终止之前的考试。\n\n确定要继续吗？`
      );
      if (!confirmed) {
        return;
      }
    }

    if (!role || !language) {
      alert("请选择角色和编程语言");
      return;
    }

    // 验证个人信息（首次填写或信息变更）
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 1. 检查是否需要保存个人信息
      // 条件：未完成 OR 数据发生变化
      const dataChanged =
        fullName.trim() !== originalData.fullName ||
        phone.trim() !== originalData.phone;

      if (!profileCompleted || dataChanged) {
        const profileResponse = await fetch("/api/user/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: fullName.trim(),
            phone: phone.trim(),
          }),
        });

        if (!profileResponse.ok) {
          const error = await profileResponse.json();
          throw new Error(error.error || "保存个人信息失败");
        }

        // 保存成功后更新原始数据
        setOriginalData({
          fullName: fullName.trim(),
          phone: phone.trim(),
        });
        setProfileCompleted(true);
      }

      // 2. 创建考试会话
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
      alert(error instanceof Error ? error.message : "操作失败");
      setLoading(false);
    }
  };

  if (checkingInProgress) {
    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="text-center">检查进行中的考试...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      {/* 进行中的考试警告 */}
      {inProgressSession && (
        <Alert className="mb-4 border-orange-500 bg-orange-50">
          <AlertDescription className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-orange-900">
                ⚠️ 您有一场正在进行中的考试
              </p>
              <p className="text-sm text-orange-800 mt-1">
                考试：{inProgressSession.examName}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                创建新考试将自动终止之前的考试
              </p>
            </div>
            <Button
              onClick={() => router.push(`/exam/${inProgressSession.sessionId}`)}
              variant="outline"
              className="border-orange-600 text-orange-700 hover:bg-orange-100"
            >
              继续之前的考试
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">考试配置</CardTitle>
          <CardDescription>
            请根据您应聘的岗位选择对应的技术栈
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 个人信息 */}
          <div className="space-y-4 pb-4 border-b">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                姓名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="请输入您的真实姓名"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={errors.fullName ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                手机号 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入11位手机号码"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
                disabled={loading}
                maxLength={11}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

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
                      const newRole = e.target.value;
                      setRole(newRole);
                      // 重置框架
                      setFramework("");
                      // 如果是全栈，自动设置为TypeScript；否则重置语言选择
                      if (newRole === "fullstack") {
                        setLanguage("typescript");
                      } else {
                        setLanguage("");
                      }
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
            disabled={
              loading ||
              !role ||
              !language ||
              (frameworkOptions.length > 0 && !framework)
            }
            className="w-full"
            size="lg"
          >
            {loading ? "创建中..." : "开始考试"}
          </Button>

          {/* 考试说明 */}
          <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
            <p>• 考试时长：10分钟</p>
            <p>• 题目数量：15题（选择题和简答题）</p>
            <p>• 考察维度：代码设计、软件架构、数据库建模、运维能力</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
