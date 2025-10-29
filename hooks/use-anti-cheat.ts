"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AntiCheatConfig {
  sessionId: string;
  onSuspiciousBehavior?: (type: string, count: number) => void;
  idleTimeoutSeconds?: number;
}

interface AntiCheatState {
  warningCount: number;
  lastWarningType: string | null;
  isTerminated: boolean;
}

export function useAntiCheat({
  sessionId,
  onSuspiciousBehavior,
  idleTimeoutSeconds = 300, // 5 minutes
}: AntiCheatConfig) {
  const [state, setState] = useState<AntiCheatState>({
    warningCount: 0,
    lastWarningType: null,
    isTerminated: false,
  });

  const lastActivityTime = useRef<number>(Date.now());
  const warningCountRef = useRef<number>(0);

  // Log suspicious behavior to backend (所有事件都记录)
  const logSuspiciousBehavior = useCallback(
    async (behaviorType: string) => {
      try {
        const response = await fetch("/api/exam/log-cheating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            behaviorType,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // 如果服务端返回terminated，立即终止考试
          if (data.terminated) {
            setState({
              warningCount: data.warnings || 5,
              lastWarningType: behaviorType,
              isTerminated: true,
            });
            alert("⛔ 考试已终止\n\n您已因多次切换标签页被系统终止考试。");
            window.location.href = "/";
          }
          return data.warnings || 0;
        }
      } catch (error) {
        console.error("Failed to log suspicious behavior:", error);
      }
      return 0;
    },
    [sessionId]
  );

  // Handle warning (仅用于tab_switch)
  const addWarning = useCallback(
    async (type: string) => {
      // 记录日志并获取服务端警告计数
      const serverWarnings = await logSuspiciousBehavior(type);

      // 更新本地状态（以服务端为准）
      warningCountRef.current = serverWarnings;
      setState({
        warningCount: serverWarnings,
        lastWarningType: type,
        isTerminated: false, // 由服务端控制终止
      });

      // Call callback
      if (onSuspiciousBehavior) {
        onSuspiciousBehavior(type, serverWarnings);
      }

      // 警告提示（3次就终止）
      if (serverWarnings === 2) {
        alert(
          `⚠️ 最后警告 (${serverWarnings}/3)\n\n您已切换标签页${serverWarnings}次。\n\n再切换1次，考试将被强制终止！\n\n请专注于考试答题。`
        );
      } else if (serverWarnings === 1) {
        alert(
          `⚠️ 警告 (${serverWarnings}/3)\n\n检测到切换标签页或窗口。\n\n请专注于考试，不要离开答题页面。\n超过3次将被强制终止考试。`
        );
      }
    },
    [logSuspiciousBehavior, onSuspiciousBehavior]
  );

  // 其他事件只记录日志，不增加警告计数，不弹窗
  const logOnly = useCallback(
    (type: string) => {
      logSuspiciousBehavior(type); // 只记录，不等待响应，不弹窗
      console.log(`[防作弊] 记录事件: ${type}`);
    },
    [logSuspiciousBehavior]
  );

  // Update activity time
  const updateActivity = useCallback(() => {
    lastActivityTime.current = Date.now();
  }, []);

  // Monitor page visibility (tab switch) - 仅此事件计入警告
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning("tab_switch"); // 唯一会增加警告计数的事件
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [addWarning]);

  // Monitor page blur - 只记录，不警告
  useEffect(() => {
    const handleBlur = () => {
      if (!document.hasFocus()) {
        logOnly("page_blur");
      }
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [logOnly]);

  // Monitor idle timeout - 只记录，不警告
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateActivity);
    });

    const checkIdleInterval = setInterval(() => {
      const idleTime = (Date.now() - lastActivityTime.current) / 1000;
      if (idleTime > idleTimeoutSeconds) {
        logOnly("idle_timeout");
        lastActivityTime.current = Date.now(); // Reset to avoid repeated logs
      }
    }, 30000); // Check every 30 seconds

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });
      clearInterval(checkIdleInterval);
    };
  }, [logOnly, updateActivity, idleTimeoutSeconds]);

  // Right-click context menu - 禁用并记录
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // 阻止右键菜单
      logOnly("context_menu");
    };

    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [logOnly]);

  // Copy/paste - 禁用并记录
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault(); // 阻止复制
      logOnly("copy");
    };

    const handlePaste = (e: ClipboardEvent) => {
      // 允许在textarea中粘贴（简答题需要）
      const target = e.target as HTMLElement;

      // 检查是否为textarea（不区分大小写）
      if (target.tagName?.toUpperCase() === "TEXTAREA") {
        console.log("[防作弊] 允许在简答题中粘贴");
        return; // 允许粘贴
      }

      // 其他地方阻止粘贴
      e.preventDefault();
      logOnly("paste");
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [logOnly]);

  return {
    warningCount: state.warningCount,
    lastWarningType: state.lastWarningType,
    isTerminated: state.isTerminated,
  };
}
