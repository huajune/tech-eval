# 安全与架构问题修复报告 - 第二轮

## 修复日期
2025-10-28

## 问题概述
根据第二轮代码审查反馈，修复了4个HIGH级别的关键问题。

---

## ✅ HIGH问题1：cheating_logs表字段映射错误

### 问题描述
`app/api/exam/log-cheating/route.ts:64-69` 插入的字段与schema定义不匹配：
- API使用：`userId`, `behaviorType`, `detectedAt`
- Schema定义：`eventType`, `durationSeconds`, `metadata`, `createdAt`

这导致代码无法通过类型检查，运行时会SQL失败。

### 原代码
```typescript
await db.insert(cheatingLogsTable).values({
  sessionId,
  userId: dbUser.id,        // ❌ 表中没有此字段
  behaviorType,             // ❌ 应该是eventType
  detectedAt: timestamp ? new Date(timestamp) : new Date(), // ❌ 应该是createdAt
});
```

### 修复后
```typescript
await db.insert(cheatingLogsTable).values({
  sessionId,
  eventType: behaviorType,  // ✅ 正确映射
  metadata: { userId: dbUser.id }, // ✅ userId存储在metadata中
  createdAt: timestamp ? new Date(timestamp) : new Date(), // ✅ 正确字段名
});
```

### 影响
- 防作弊日志现在可以正常写入数据库
- 符合schema定义，通过类型检查

---

## ✅ HIGH问题2：防作弊规则过于严格（用户认为OK）

### 用户反馈
用户明确表示当前的防作弊限制（3次警告后终止、禁止复制粘贴等）是可接受的，无需修改。

### 当前规则
- Tab切换：警告
- 页面失焦：警告
- 空闲5分钟：警告
- 右键菜单：警告
- 复制：警告
- **3次警告后自动终止考试**

### 决定
保持现状，不做修改。

---

## ✅ HIGH问题3：客户端倒计时 + 缺失服务端心跳

### 问题描述
`app/exam/[sessionId]/page.tsx:95-111` 完全依赖客户端setInterval计时，存在安全漏洞：
1. 用户可以修改客户端代码延长时间
2. 时间到时弹出confirm，用户可以点取消继续答题
3. 没有实现PRD要求的"每30秒心跳+服务端计时"

### 修复方案

#### 1. 新增heartbeat API
创建 `/api/exam/heartbeat` 端点：

```typescript
// 每次心跳检查：
// 1. 服务端计算剩余时间（基于session.startTime）
const startTime = new Date(session.startTime);
const elapsedMs = Date.now() - startTime.getTime();
const remainingMs = Math.max(0, 10 * 60 * 1000 - elapsedMs);

// 2. 时间到自动提交
if (remainingSeconds <= 0) {
  await db.update(examSessionsTable).set({
    status: "completed",
    endTime: new Date(),
  });
  return { shouldAutoSubmit: true };
}

// 3. 返回服务端剩余时间
return { remainingSeconds };
```

#### 2. 前端集成心跳机制

```typescript
// 每30秒向服务端发送心跳
useEffect(() => {
  const heartbeat = async () => {
    const response = await fetch("/api/exam/heartbeat", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    // 更新剩余时间（以服务端为准）
    setRemainingSeconds(data.remainingSeconds);

    // 时间到自动提交（无confirm，无法取消）
    if (data.shouldAutoSubmit) {
      alert("考试时间已到，系统已自动提交！");
      router.push(`/exam/${sessionId}/result`);
    }
  };

  heartbeat(); // 立即执行
  const interval = setInterval(heartbeat, 30000); // 每30秒
  return () => clearInterval(interval);
}, [sessionData]);

// 客户端倒计时仅用于UI显示
useEffect(() => {
  const timer = setInterval(() => {
    setRemainingSeconds((prev) => Math.max(0, prev - 1));
  }, 1000);
  return () => clearInterval(timer);
}, [remainingSeconds]);
```

#### 3. 修复提交逻辑

```typescript
// 支持手动和自动提交
const handleSubmit = async (isAutoSubmit = false) => {
  // 手动提交需要确认，自动提交不需要
  if (!isAutoSubmit && !confirm("确定要提交考试吗？")) {
    return;
  }
  // ... 提交逻辑
};
```

### 影响
- ✅ 时间控制权在服务端，无法篡改
- ✅ 时间到强制提交，无法取消
- ✅ 每30秒同步一次，防止时间偏差
- ✅ 符合PRD的安全要求

---

## ✅ HIGH问题4：简答题评分逻辑错误

### 问题描述
GPT提到此问题，但实际上在第一轮修复中已经解决。

### 第一轮修复（已完成）
```typescript
// 简答题：只有已人工评分时才计入总分
if (answer.manualScore !== null) {
  abilityScores[dimension].score += answer.manualScore;
  abilityScores[dimension].total += 5;
}
// manualScore为null时跳过，既不计入分子也不计入分母
```

### 状态
✅ 已在第一轮修复，无需再次修改。

---

## ✅ HIGH问题5：questionId验证缺失

### 问题描述
GPT提到此问题，但实际上在第一轮修复中已经解决。

### 第一轮修复（已完成）
```typescript
// 5. 验证questionId是否属于本次考试的选定题目（防止作弊）
const selectedQuestionIds = session.selectedQuestions as string[];
if (!selectedQuestionIds.includes(questionId)) {
  return NextResponse.json(
    { error: "无效的题目ID，该题目不属于本次考试" },
    { status: 403 }
  );
}
```

### 状态
✅ 已在第一轮修复，无需再次修改。

---

## ✅ HIGH问题6：管理员鉴权缺失

### 问题描述
`app/api/admin/pending-grading/route.ts` 和 `submit-score/route.ts` 没有管理员鉴权，任何登录用户都能：
1. 获取所有考生的简答题答案
2. 查看参考答案
3. 提交评分修改总分

此外还使用了 `user.name` 但schema中是 `fullName`。

### 修复方案

#### 1. 添加管理员权限验证

```typescript
export async function GET() {
  // 1. 验证用户登录
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // 2. 验证管理员权限
  const dbUsers = await db.select()
    .from(usersTable)
    .where(eq(usersTable.authUserId, user.id))
    .limit(1);

  const dbUser = dbUsers[0];
  if (dbUser.role !== "admin") {
    return NextResponse.json(
      { error: "权限不足，仅限管理员访问" },
      { status: 403 }
    );
  }

  // 3. 继续后续逻辑...
}
```

#### 2. 修复字段名

```typescript
// 修改前
userName: record.user.name  // ❌ 字段不存在

// 修改后
userName: record.user.fullName  // ✅ 正确字段名
```

### 影响
- ✅ 只有role为"admin"的用户才能访问评分接口
- ✅ 防止普通用户查看参考答案
- ✅ 防止恶意篡改考试分数
- ✅ 代码通过类型检查

---

## 📊 修复总结

### 第二轮修复清单
1. ✅ 修复cheating_logs表字段映射（HIGH）
2. ⏭️ 防作弊规则（用户认为OK，不修改）
3. ✅ 实现服务端心跳机制+计时（HIGH）
4. ✅ 简答题评分逻辑（第一轮已修复）
5. ✅ questionId验证（第一轮已修复）
6. ✅ 添加管理员鉴权（HIGH）

### 新增文件
- `app/api/exam/heartbeat/route.ts` - 服务端心跳和计时API

### 修改文件
- `app/api/exam/log-cheating/route.ts` - 字段映射修复
- `app/api/admin/pending-grading/route.ts` - 管理员鉴权 + 字段名修复
- `app/api/admin/submit-score/route.ts` - 管理员鉴权
- `app/exam/[sessionId]/page.tsx` - 集成心跳机制

---

## 🧪 测试建议

### 1. 管理员鉴权测试

**测试普通用户无法访问：**
```bash
# 以普通用户身份登录后访问
curl http://localhost:3000/api/admin/pending-grading

# 预期：返回 403 "权限不足，仅限管理员访问"
```

**测试管理员可以访问：**
1. 在数据库中将某个用户的role设置为"admin"
2. 登录该用户
3. 访问 `/admin/grading`
4. 预期：正常显示待评分列表

### 2. 服务端心跳测试

**测试时间控制：**
1. 创建考试会话
2. 打开浏览器DevTools → Network标签
3. 观察每30秒发送一次 `/api/exam/heartbeat` 请求
4. 验证响应中的 `remainingSeconds` 在逐渐减少
5. 等待10分钟后，验证是否自动提交

**测试时间篡改防护：**
1. 修改客户端倒计时代码（如改为每10秒减1）
2. 验证心跳仍然每30秒同步服务端时间
3. 10分钟后仍然强制提交

### 3. cheating_logs测试

**测试日志写入：**
1. 在考试页面切换Tab
2. 检查数据库 `cheating_logs` 表
3. 验证记录存在，字段正确：
   - `event_type` = "tab_switch"
   - `metadata` 包含 userId
   - `created_at` 有值

---

## 🎯 架构改进

### 时间控制架构
**Before:**
```
Client (setInterval) → Time's up → confirm() → User can cancel
```

**After:**
```
Server (计时) ← 30s heartbeat ← Client (UI显示)
         ↓
  Time's up → Auto submit (强制)
```

### 权限控制架构
**Before:**
```
Anyone → /admin/* → Access granted ❌
```

**After:**
```
User → Auth → Check role → Admin only → Access granted ✅
                         → Not admin → 403 Forbidden
```

---

## 📝 待办事项（后续优化）

1. **用户角色管理界面**
   - 目前需要手动修改数据库来设置管理员
   - 建议添加管理员注册/管理界面

2. **警告次数统计**
   - 虽然前端限制3次警告，但未实现服务端统计
   - 建议在exam_sessions添加cheating_warnings字段
   - 心跳时检查警告次数，超过阈值自动终止

3. **心跳失败处理**
   - 当前心跳失败只打印日志
   - 建议添加重试机制和降级策略

---

**第二轮修复完成，所有HIGH级别问题已解决。** ✅
