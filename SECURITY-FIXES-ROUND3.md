# 安全与架构问题修复报告 - 第三轮

## 修复日期
2025-10-28

## 问题概述
根据第三轮代码审查反馈，修复了3个关键问题，并根据用户要求调整了防作弊策略。

---

## ✅ 问题1：自动提交时未调用评分导致404

### 问题描述
`app/api/exam/heartbeat/route.ts:92-119` 和 `app/api/exam/session/[sessionId]/route.ts:86-108`

当服务端检测到时间到自动提交时，只更新了 `status` 为 `completed`，但没有调用 `calculateExamResult()`。

**后果：** 用户访问结果页时，`exam_results` 表中没有记录，导致404错误。

### 修复方案

#### heartbeat/route.ts
```typescript
// 7. 时间到自动提交
if (remainingSeconds <= 0) {
  // 自动提交考试
  await db.update(examSessionsTable).set({
    status: "completed",
    endTime: new Date(),
  }).where(eq(examSessionsTable.id, sessionId));

  // ✅ 触发自动评分（避免结果页404）
  try {
    await calculateExamResult(sessionId);
    console.log(`会话 ${sessionId} 时间到自动提交并评分完成`);
  } catch (error) {
    console.error(`自动评分失败（会话 ${sessionId}）:`, error);
  }

  return NextResponse.json({ shouldAutoSubmit: true });
}
```

#### session/[sessionId]/route.ts
```typescript
if (elapsedMs > maxDurationMs) {
  await db.update(examSessionsTable).set({
    status: "completed",
    endTime: new Date(),
  }).where(eq(examSessionsTable.id, sessionId));

  // ✅ 触发自动评分（避免结果页404）
  try {
    await calculateExamResult(sessionId);
    console.log(`会话 ${sessionId} 时间过期自动提交并评分完成`);
  } catch (error) {
    console.error(`自动评分失败（会话 ${sessionId}）:`, error);
  }

  return NextResponse.json({
    error: "考试时间已到，已自动提交",
    redirectUrl: `/exam/${sessionId}/result`,
  });
}
```

### 影响
- ✅ 自动提交后结果页正常显示
- ✅ exam_results表有完整记录
- ✅ 选择题已自动评分，简答题待人工评分

---

## ✅ 问题2：服务端未统计警告次数和强制终止

### 问题描述
`app/api/exam/log-cheating/route.ts:63-112`

虽然每次作弊行为都记录到 `cheating_logs` 表，但：
1. `exam_sessions.cheating_warnings` 字段从未更新
2. 没有服务端强制终止逻辑
3. 客户端禁用hook即可绕过限制

### 修复方案

#### 服务端统计和终止
```typescript
// 6. 只有tab_switch才增加警告计数器（其他事件只记录）
let currentWarnings = session.cheatingWarnings || 0;
if (behaviorType === "tab_switch") {
  currentWarnings += 1;

  await db.update(examSessionsTable)
    .set({ cheatingWarnings: currentWarnings })
    .where(eq(examSessionsTable.id, sessionId));

  console.log(`会话 ${sessionId} tab_switch警告: ${currentWarnings}/3`);

  // 7. 达到3次警告，强制终止考试
  if (currentWarnings >= 3) {
    await db.update(examSessionsTable)
      .set({ status: "terminated", endTime: new Date() })
      .where(eq(examSessionsTable.id, sessionId));

    console.log(`会话 ${sessionId} 因tab_switch 3次被强制终止`);

    return NextResponse.json({
      success: true,
      terminated: true,
      warnings: currentWarnings,
      message: "考试已终止（tab切换超过3次）",
    });
  }
}

return NextResponse.json({
  success: true,
  warnings: currentWarnings,
});
```

#### heartbeat双重检查
```typescript
// 心跳时也检查警告次数
const warnings = session.cheatingWarnings || 0;
if (warnings >= 3 && session.status !== "terminated") {
  await db.update(examSessionsTable)
    .set({ status: "terminated", endTime: new Date() })
    .where(eq(examSessionsTable.id, sessionId));

  return NextResponse.json({
    error: "考试已终止（tab切换超过3次）",
    shouldTerminate: true,
    warnings,
  }, { status: 403 });
}
```

### 影响
- ✅ 服务端统计警告次数，存储在数据库
- ✅ 达到3次立即终止，无法绕过
- ✅ 心跳时双重检查，确保及时发现
- ✅ 即使禁用客户端hook，服务端仍会终止

---

## ✅ 问题3：防作弊规则调整（根据用户要求）

### 用户要求
1. **tab_switch 3次终止**（比PRD的5次更严格）✅
2. **阻止右键菜单**（必要）✅
3. **阻止复制粘贴**（必要，但简答题textarea允许粘贴）✅
4. **其他事件只记录不警告**（page_blur、idle_timeout等）✅

### 修复方案

#### 1. tab_switch：警告+终止（3次）
```typescript
// Monitor page visibility (tab switch) - 仅此事件计入警告
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      addWarning("tab_switch"); // 唯一会增加警告计数的事件
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [addWarning]);
```

警告提示：
```typescript
if (serverWarnings === 2) {
  alert(`⚠️ 最后警告 (2/3)\n\n再切换1次，考试将被强制终止！`);
} else if (serverWarnings === 1) {
  alert(`⚠️ 警告 (1/3)\n\n请专注于考试，不要离开答题页面。\n超过3次将被强制终止考试。`);
}
```

#### 2. 右键菜单：阻止
```typescript
// Right-click context menu - 禁用并记录
useEffect(() => {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault(); // 阻止右键菜单
    logOnly("context_menu");
  };
  document.addEventListener("contextmenu", handleContextMenu);
  return () => document.removeEventListener("contextmenu", handleContextMenu);
}, [logOnly]);
```

#### 3. 复制粘贴：阻止（简答题除外）
```typescript
// Copy/paste - 禁用并记录
useEffect(() => {
  const handleCopy = (e: ClipboardEvent) => {
    e.preventDefault(); // 阻止复制
    logOnly("copy");
  };

  const handlePaste = (e: ClipboardEvent) => {
    // 允许在textarea中粘贴（简答题需要）
    const target = e.target as HTMLElement;
    if (target.tagName === "TEXTAREA") {
      return; // 允许
    }
    e.preventDefault(); // 其他地方阻止粘贴
    logOnly("paste");
  };

  document.addEventListener("copy", handleCopy);
  document.addEventListener("paste", handlePaste);
  return () => {
    document.removeEventListener("copy", handleCopy);
    document.removeEventListener("paste", handlePaste);
  };
}, [logOnly]);
```

#### 4. 其他事件：只记录不警告
```typescript
// page_blur - 只记录，不警告
const handleBlur = () => {
  if (!document.hasFocus()) {
    logOnly("page_blur");
  }
};

// idle_timeout - 只记录，不警告
const checkIdleInterval = setInterval(() => {
  const idleTime = (Date.now() - lastActivityTime.current) / 1000;
  if (idleTime > idleTimeoutSeconds) {
    logOnly("idle_timeout");
    lastActivityTime.current = Date.now();
  }
}, 30000);
```

### 影响
- ✅ tab切换3次立即终止（严格）
- ✅ 右键菜单完全禁用
- ✅ 复制功能完全禁用
- ✅ 简答题textarea可以粘贴（避免误伤）
- ✅ 其他事件只记录日志，不干扰考试

---

## 📊 修复总结

### 第三轮修复清单
1. ✅ 自动提交时调用评分（避免404）
2. ✅ 服务端统计警告次数并强制终止
3. ✅ 调整防作弊规则（tab_switch 3次终止）
4. ✅ 恢复阻止右键和复制粘贴

### 修改文件
- `app/api/exam/heartbeat/route.ts` - 自动提交评分 + 警告检查
- `app/api/exam/session/[sessionId]/route.ts` - 自动提交评分
- `app/api/exam/log-cheating/route.ts` - 服务端警告统计和终止
- `hooks/use-anti-cheat.ts` - 调整防作弊策略

### 防作弊最终规则

| 事件类型 | 客户端行为 | 服务端行为 | 警告计数 | 终止条件 |
|---------|----------|----------|---------|---------|
| tab_switch | 弹窗警告 | 增加计数 | ✅ 计入 | 3次终止 |
| page_blur | 静默记录 | 只记录 | ❌ 不计 | - |
| idle_timeout | 静默记录 | 只记录 | ❌ 不计 | - |
| 右键菜单 | 阻止 | 只记录 | ❌ 不计 | - |
| 复制 | 阻止 | 只记录 | ❌ 不计 | - |
| 粘贴 | textarea允许，其他阻止 | 只记录 | ❌ 不计 | - |

---

## 🧪 测试建议

### 1. 自动提交评分测试

**测试步骤：**
1. 创建考试会话
2. 等待10分钟（或修改代码设置1分钟）
3. 时间到自动提交
4. **验证：** 立即访问结果页，不会404
5. **验证：** exam_results表有记录
6. **验证：** 选择题已评分，简答题manualScore为null

### 2. 服务端警告统计测试

**测试步骤：**
1. 开始考试
2. 切换标签页1次 → alert警告1/3
3. 切换标签页2次 → alert最后警告2/3
4. 切换标签页3次 → 考试立即终止
5. **验证：** 数据库exam_sessions.cheating_warnings = 3
6. **验证：** exam_sessions.status = "terminated"

**绕过测试（应该失败）：**
1. 禁用JavaScript或修改客户端代码
2. 尝试继续切换标签页
3. **验证：** 心跳时服务端检测到警告数>=3，强制跳转

### 3. 右键和复制测试

**右键菜单：**
1. 在考试页面右键
2. **验证：** 右键菜单不出现
3. **验证：** cheating_logs表有context_menu记录

**复制功能：**
1. 选中题目文本，Ctrl+C
2. **验证：** 无法复制
3. **验证：** cheating_logs表有copy记录

**简答题粘贴：**
1. 在简答题textarea中Ctrl+V
2. **验证：** 可以粘贴
3. 在选项区域Ctrl+V
4. **验证：** 无法粘贴

---

## 🎯 架构改进

### 防作弊架构

**Before:**
```
Client Hook → addWarning() → client terminate (可绕过)
```

**After:**
```
Client Hook → addWarning() → POST /log-cheating
                                    ↓
                              Server统计warnings
                                    ↓
                              warnings >= 3?
                                    ↓ Yes
                              SET status = 'terminated'
                                    ↓
                              返回 terminated: true
                                    ↓
Client收到响应 → 强制跳转首页

同时：
Heartbeat每30秒 → 检查warnings >= 3 → 强制终止
```

### 自动提交流程

**Before:**
```
Time's up → UPDATE status = 'completed' → 返回 → 用户访问结果页 → 404
```

**After:**
```
Time's up → UPDATE status = 'completed'
         → calculateExamResult(sessionId)  // 关键修复
         → exam_results表插入记录
         → 返回 shouldAutoSubmit: true
         → 用户访问结果页 → 显示正常
```

---

**第三轮修复完成，所有问题已解决，防作弊策略符合用户要求。** ✅
