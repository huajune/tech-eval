# API接口契约与安全规范

**版本：** v1.0 MVP
**创建日期：** 2025-10-28

---

## 一、核心安全原则

### 1.1 答案保护（最高优先级）

**原则：** 客户端永不接收 `correct_answer`、`weight`、`reference_answer` 等敏感字段

```typescript
// ❌ 错误示例：泄露答案
GET /api/exam/questions?session_id=xxx
Response: {
  questions: [
    {
      id: "uuid",
      content: "题目内容",
      options: { A: "...", B: "..." },
      correct_answer: ["B"], // ⚠️ 泄露！
      weight: 1
    }
  ]
}

// ✅ 正确示例：脱敏返回
GET /api/exam/questions?session_id=xxx
Response: {
  questions: [
    {
      id: "uuid",
      content: "题目内容",
      type: "single",
      options: { A: "...", B: "..." }
      // 不返回 correct_answer、weight、explanation
    }
  ]
}
```

### 1.2 服务端评分

**原则：** 所有答案比对和评分逻辑在服务端执行

```typescript
// 客户端提交答案
POST /api/exam/save-answer
Body: {
  session_id: "uuid",
  question_id: "uuid",
  user_answer: ["B"]
}

// 服务端比对后返回（选择题可选择性返回）
Response: {
  success: true,
  is_correct: true // 可选：实时反馈，或等提交后统一计算
}
```

### 1.3 会话验证

**原则：** 每个API请求必须验证会话归属和状态

```typescript
// 验证逻辑（所有API通用）
async function validateExamSession(sessionId: string, userId: string) {
  const session = await db.query.examSessionsTable.findFirst({
    where: and(
      eq(examSessionsTable.id, sessionId),
      eq(examSessionsTable.user_id, userId)
    )
  });

  if (!session) throw new Error('会话不存在');
  if (session.status === 'completed') throw new Error('考试已完成');
  if (session.status === 'terminated') throw new Error('考试已终止');

  // 检查是否超时
  const elapsed = Date.now() - session.start_time.getTime();
  const maxDuration = session.duration_minutes * 60 * 1000;
  if (elapsed > maxDuration) {
    await autoSubmitExam(sessionId);
    throw new Error('考试时间已到');
  }

  return session;
}
```

---

## 二、API接口契约

### 2.1 创建考试会话

**端点：** `POST /api/exam/create-session`

**请求：**
```typescript
{
  role: 'frontend' | 'backend' | 'fullstack',
  language: 'typescript' | 'java' | 'python',
  framework: 'nextjs' | 'react' | 'spring' | 'django' | 'express'
}
```

**响应：**
```typescript
{
  session_id: string,
  start_time: string, // ISO 8601
  duration_minutes: number, // 10
  remaining_seconds: number, // 600
  questions: [
    {
      id: string,
      content: string,
      type: 'single' | 'multiple' | 'essay',
      options?: { A: string, B: string, C: string, D: string },
      ability_dimension: 'code_design' | 'architecture' | 'database' | 'devops',
      // ⚠️ 不返回：correct_answer, weight, explanation, reference_answer
    }
  ]
}
```

**业务逻辑：**
1. 验证用户登录状态
2. 查询是否存在 `status='in_progress'` 的旧会话；若存在且用户确认开启新考试，则自动将旧会话标记为 `terminated`（写入 `end_time`）
3. 根据配置调用题目选择算法，抽取20题（覆盖所有能力维度）
4. 创建新的会话记录（status='in_progress'，remaining_seconds=600）
5. 返回脱敏后的题目列表

> 前置约定：调用方需在发起本请求前保存/确认候选人的 `fullName`、`phone` 信息（见「用户资料」接口），以满足业务合规要求。

**错误码：**
- `400` - 参数错误
- `401` - 未登录
- `500` - 服务器错误

---

### 2.2 检查进行中的考试

**端点：** `GET /api/exam/check-in-progress`

**响应：**
```typescript
// 无进行中的考试
{ hasInProgress: false }

// 有进行中的考试
{
  hasInProgress: true,
  sessionId: string,
  examName: string,
  startTime: string,
  remainingSeconds: number
}
```

**业务逻辑：**
1. 验证用户登录状态，并获取关联的 `users` 记录
2. 查询当前用户 `status='in_progress'` 且未超时的考试会话
3. 若会话已超过考试时长，自动将其标记为 `terminated` 并返回 `hasInProgress=false`
4. 否则返回会话信息，供前端提醒候选人继续或终止

**使用场景：** 考试配置页/首页加载时提示候选人是否存在未完成考试

---

### 2.3 获取会话信息（断线恢复）

**端点：** `GET /api/exam/session/:sessionId`

**响应：**
```typescript
{
  session_id: string,
  status: 'in_progress' | 'completed' | 'terminated',
  start_time: string,
  remaining_seconds: number,
  cheating_warnings: number,
  questions: [ /* 同创建会话的格式 */ ],
  answers: {
    [question_id]: {
      user_answer: any,
      answered_at: string
    }
  }
}
```

**业务逻辑：**
1. 验证会话归属（session.user_id === current_user.id）
2. 计算剩余时间（基于start_time和duration）
3. 返回已保存的答案

**使用场景：** 用户刷新页面后恢复考试状态

---

### 2.4 保存答案

**端点：** `POST /api/exam/save-answer`

**请求：**
```typescript
{
  session_id: string,
  question_id: string,
  user_answer: string[] | string // ['A'] 或 ['A', 'C'] 或 "essay text"
}
```

**响应：**
```typescript
{
  success: boolean,
  // 选择题可选择性返回 is_correct（如需实时反馈）
  is_correct?: boolean
}
```

**业务逻辑：**
1. 验证会话（validateExamSession）
2. 验证question_id在selected_questions中
3. Upsert答案记录（session_id + question_id唯一）
4. 选择题自动判分（比对correct_answer）
5. 简答题：
   - 验证字数 ≤ 150字
   - is_correct = null, manual_score = null

**限流：** 同一会话每秒最多2次请求

---

### 2.5 心跳同步

**端点：** `POST /api/exam/heartbeat`

**请求：**
```typescript
{
  session_id: string,
  remaining_seconds: number, // 客户端当前剩余时间
  current_question_index: number // 可选：用户当前答题位置
}
```

**响应：**
```typescript
{
  server_remaining_seconds: number, // 服务端计算的剩余时间
  should_terminate: boolean, // 是否应该强制结束
  warnings: number // 当前作弊警告次数
}
```

**业务逻辑：**
1. 验证会话
2. 服务端计算实际剩余时间：
   ```typescript
   const elapsed = Date.now() - session.start_time.getTime();
   const maxDuration = session.duration_minutes * 60 * 1000;
   const serverRemaining = Math.max(0, maxDuration - elapsed);
   ```
3. 更新session表的remaining_seconds（取服务端计算值）
4. 如果serverRemaining <= 0，返回should_terminate=true

**调用频率：** 每30秒调用一次

---

### 2.6 记录作弊行为

**端点：** `POST /api/exam/log-cheating`

**请求：**
```typescript
{
  session_id: string,
  event_type: 'page_blur' | 'tab_switch' | 'idle_timeout' | 'copy_paste',
  duration_seconds?: number, // tab_switch时必填
  metadata?: object // 额外信息
}
```

**响应：**
```typescript
{
  success: boolean,
  warnings: number, // 当前累计警告次数
  should_terminate: boolean // 是否达到5次需要强制提交
}
```

**业务逻辑：**
1. 验证会话
2. 插入cheating_logs记录
3. 如果event_type为'tab_switch'，增加cheating_warnings计数
4. 如果warnings >= 5，更新session.status = 'terminated'，触发自动提交

**作弊规则：**
```typescript
const CHEATING_RULES = {
  page_blur: { countAsWarning: false }, // 仅记录
  tab_switch: { countAsWarning: true, threshold: 5 },
  idle_timeout: { countAsWarning: false }, // 仅提示
  copy_paste: { countAsWarning: false } // MVP仅记录
};
```

---

### 2.7 提交考试

**端点：** `POST /api/exam/submit`

**请求：**
```typescript
{
  session_id: string
}
```

**响应：**
```typescript
{
  success: boolean,
  result_id: string, // 用于跳转到结果页
  redirect_url: string // /exam/:sessionId/result
}
```

**业务逻辑：**
1. 验证会话
2. 检查是否已提交（幂等性）
3. 更新session.status = 'completed', end_time = now()
4. 触发自动评分：
   ```typescript
   await calculateExamResult(sessionId);
   ```
5. 生成exam_results记录
6. 返回跳转URL

**自动提交触发条件：**
- 时间到（服务端计算elapsed >= duration）
- 作弊达到5次
- 用户手动点击提交

---

### 2.8 获取考试结果

**端点：** `GET /api/exam/result/:sessionId`

**响应：**
```typescript
{
  session_id: string,
  completed_at: string,
  time_taken_minutes: number,
  // 以下字段仅管理员返回
  total_score?: number,
  ability_scores?: {
    code_design: number,
    architecture: number,
    database: number,
    devops: number
  },
  estimated_level?: 'P5' | 'P6' | 'P7' | 'P8' | 'P9',
  pass_status?: boolean
}
```

**业务逻辑：**
1. 验证会话归属；若当前用户为管理员则放宽为可访问任意会话
2. 查询 `exam_results`、`exam_sessions` 获取分数与完成时间
3. 计算考试耗时（分钟）
4. 根据用户角色构建响应：
   - 管理员：返回完整分数、能力维度、职级
   - 候选人：隐藏分数、职级等敏感字段，仅返回考试完成时间与耗时

---

### 2.9 获取答案解析

**端点：** `GET /api/exam/answers/:sessionId`

**响应：**
```typescript
{
  questions: [
    {
      id: string,
      content: string,
      type: string,
      options?: object,
      correct_answer: any, // ✅ 提交后才返回
      explanation: string,
      user_answer: any,
      is_correct: boolean | null,
      manual_score?: number // 简答题，浮点数
    }
  ]
}
```

**权限：**
- 候选人：仅可查看自己的、且 `status='completed'` 的会话
- 管理员：可查看任意会话（用于复核答案与解析）

---

### 2.10 管理员：获取待评阅列表

**端点：** `GET /api/admin/pending-grading`

**权限：** `user.role === 'admin'`

**响应：**
```typescript
{
  pendingSessions: [
    {
      sessionId: string,
      userId: string,
      userEmail: string,
      userName: string | null,
      completedAt: string | null,
      answers: [
        {
          answerId: string,
          questionId: string,
          questionContent: string,
          abilityDimension: 'architecture' | 'code_design' | 'database' | 'devops',
          weight: number,
          referenceAnswer: string | null,
          explanation: string | null,
          userAnswer: string,
          answeredAt: string
        }
      ]
    }
  ],
  totalCount: number
}
```

---

### 2.11 管理员：提交评分

**端点：** `POST /api/admin/submit-score`

**权限：** `user.role === 'admin'`

**请求：**
```typescript
{
  answerId: string,
  score: number,   // 0 ~ question.weight，支持0.5步进
  sessionId: string
}
```

**响应：**
```typescript
{
  success: true,
  newTotalScore: number,
  newLevel: 'P5' | 'P6' | 'P7' | 'P8' | 'P9'
}
```

**业务逻辑：**
1. 验证管理员权限
2. 查询答案及对应题目，确认题目权重（最大分）
3. 校验 `score` 在 `[0, weight]` 范围内（数据库 `manual_score` 类型为 `real`，支持小数）
4. 更新 `answers`：`manual_score`、`graded_at`
5. 调用 `calculateExamResult` 重新计算会话总分与职级

---

### 2.12 用户：获取个人资料

**端点：** `GET /api/user/profile`

**响应：**
```typescript
{
  email: string,
  fullName: string | null,
  phone: string | null,
  profileCompleted: boolean,
  role: 'candidate' | 'admin'
}
```

**业务逻辑：**
1. 验证 Supabase 登录状态
2. 读取 `users` 表中的用户记录
3. 若记录不存在，返回空信息并视为 `profileCompleted=false`

---

### 2.13 用户：完善个人信息

**端点：** `POST /api/user/complete-profile`

**请求：**
```typescript
{
  fullName: string, // ≥ 2 个字符
  phone: string     // 大陆手机号格式，系统唯一
}
```

**业务逻辑：**
1. 验证 Supabase 登录状态
2. 校验姓名/手机号格式
3. 检查手机号是否已被其他用户绑定（数据库唯一约束）
4. 若 `users` 记录不存在则创建；存在则更新，并置 `profile_completed=true`

**错误码：**
- `400` - 参数缺失/格式错误或手机号已被使用
- `401` - 未登录
- `500` - 服务器错误

---

## 三、数据脱敏规范

### 3.1 题目查询脱敏

```typescript
// lib/exam/sanitize-questions.ts
export function sanitizeQuestions(questions: Question[]): SanitizedQuestion[] {
  return questions.map(q => ({
    id: q.id,
    content: q.content,
    type: q.type,
    options: q.options,
    ability_dimension: q.ability_dimension,
    // 移除敏感字段
    // correct_answer: REMOVED
    // weight: REMOVED
    // explanation: REMOVED
    // reference_answer: REMOVED
  }));
}
```

### 3.2 评阅端脱敏

```typescript
// 管理员评阅时，返回reference_answer但不返回correct_answer
export function sanitizeForGrading(question: Question) {
  return {
    id: question.id,
    content: question.content,
    type: question.type,
    reference_answer: question.reference_answer, // ✅ 参考答案
    explanation: question.explanation, // ✅ 评分标准
    // correct_answer: REMOVED（选择题答案不给评阅者）
  };
}
```

---

## 四、错误处理规范

### 4.1 标准错误响应

```typescript
{
  error: {
    code: string, // 'SESSION_NOT_FOUND', 'UNAUTHORIZED', etc.
    message: string, // 用户友好的错误消息
    details?: any // 开发环境返回详细信息
  }
}
```

### 4.2 常见错误码

| HTTP状态码 | 错误码 | 说明 |
|-----------|--------|------|
| 400 | INVALID_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未登录或token失效 |
| 403 | FORBIDDEN | 无权限访问 |
| 404 | SESSION_NOT_FOUND | 会话不存在 |
| 409 | SESSION_COMPLETED | 考试已完成 |
| 410 | SESSION_TERMINATED | 考试已终止（作弊） |
| 429 | RATE_LIMIT_EXCEEDED | 请求过于频繁 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

---

## 五、性能与安全要求

### 5.1 API限流

> **MVP实现说明：** 若无Redis，采用**内存限流器**（如`@upstash/ratelimit`的memory store或自定义Map），限制在**单实例场景**。生产环境推荐使用Upstash Redis实现分布式限流。

```typescript
// middleware/rate-limit.ts
import { ratelimit } from '@/lib/redis'; // 使用Upstash Redis或内存实现

export async function rateLimitMiddleware(req: Request) {
  const identifier = `${req.ip}:${req.url}`;

  const { success, remaining } = await ratelimit.limit(identifier);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
}

// 不同接口的限流策略
const RATE_LIMITS = {
  '/api/exam/create-session': { requests: 3, window: '10m' },
  '/api/exam/save-answer': { requests: 120, window: '1m' }, // 平均2rps
  '/api/exam/heartbeat': { requests: 10, window: '1m' },
  '/api/exam/log-cheating': { requests: 30, window: '1m' },
};
```

### 5.2 CSRF保护

```typescript
// Next.js默认在Server Actions中提供CSRF保护
// API Routes需要验证Origin header

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && !origin.includes(host)) {
    return new Response('Forbidden', { status: 403 });
  }

  // 继续处理
}
```

### 5.3 SQL注入防护

```typescript
// ✅ 使用Drizzle ORM参数化查询（自动防护）
await db
  .select()
  .from(examSessionsTable)
  .where(eq(examSessionsTable.id, sessionId));

// ❌ 避免原始SQL拼接
// await db.execute(`SELECT * FROM exam_sessions WHERE id = '${sessionId}'`);
```

---

## 六、手工验证清单（MVP测试）

### ✅ 安全性验证

- [ ] **答案泄露检查**
  - [ ] 浏览器Network抓包：所有API响应中不含`correct_answer`字段
  - [ ] 前端源码检查：全局搜索无硬编码答案
  - [ ] 题目API只返回题目内容和选项

- [ ] **会话验证**
  - [ ] 无法访问他人的会话（修改sessionId返回403）
  - [ ] 已完成的会话无法继续答题
  - [ ] 已终止的会话无法恢复

- [ ] **权限验证**
  - [ ] 普通用户无法访问`/api/admin/*`接口
  - [ ] 管理员可以访问评阅接口
  - [ ] 评阅接口不返回选择题答案

### ✅ 功能验证

- [ ] **考试流程**
  - [ ] 配置→说明→答题→提交→结果页，全流程无阻塞
  - [ ] 同一配置多次创建会话，题目不同且分布符合策略
  - [ ] 题目数量固定20题（18选择 + 2简答）
  - [ ] 简答题字数超过150字时前端+后端都拦截

- [ ] **计时与心跳**
  - [ ] 倒计时显示准确
  - [ ] 心跳每30秒调用一次
  - [ ] 时间到自动提交（服务端强制）
  - [ ] 刷新页面后剩余时间正确恢复

- [ ] **防作弊**
  - [ ] 切换Tab 3次弹窗警告
  - [ ] 切换Tab 5次强制提交并标记"疑似作弊"
  - [ ] 空闲2分钟弹窗提示但不计入作弊次数
  - [ ] 复制粘贴行为被记录到cheating_logs

- [ ] **答案保存**
  - [ ] 切换题目时立即保存
  - [ ] 30秒定时自动保存
  - [ ] 刷新页面后答案正确恢复

- [ ] **评分与结果**
  - [ ] 单选题：全对得分，错选0分
  - [ ] 多选题：全对得分，漏选/错选0分
  - [ ] 简答题标记"待评阅"
  - [ ] 能力雷达图4个维度正确显示
  - [ ] 职级评估映射正确（P5-P9）
  - [ ] 管理员评分后总分重新计算

### ✅ 性能验证

- [ ] **响应时间**
  - [ ] 创建会话 < 2秒
  - [ ] 保存答案 < 500ms
  - [ ] 提交考试 < 3秒
  - [ ] 结果页加载 < 2秒

- [ ] **并发测试**
  - [ ] 50人同时考试无阻塞
  - [ ] API限流正常工作（429响应）

### ✅ 边界情况

- [ ] **异常情况**
  - [ ] 网络断开后重连，会话正常恢复
  - [ ] 后端重启后，进行中的会话可以继续
  - [ ] 题库题量不足时，创建会话失败并提示
  - [ ] 重复提交考试返回幂等结果

- [ ] **数据一致性**
  - [ ] 同一用户不能同时开启多个考试
  - [ ] 答案表session_id+question_id唯一约束生效
  - [ ] 作弊警告次数与日志记录一致

---

## 七、实施优先级

### P0（MVP必须）
- ✅ 答案保护（脱敏返回）
- ✅ 服务端评分
- ✅ 会话验证
- ✅ 心跳同步
- ✅ 作弊日志记录
- ✅ 基础限流（内存级别即可）

### P1（MVP推荐）
- ✅ CSRF保护
- ✅ 详细错误码
- ✅ 手工验证清单执行

### P2（V2优化）
- ❌ Redis分布式限流
- ❌ API响应缓存
- ❌ WebSocket实时推送
- ❌ 审计日志持久化

---

**文档维护者：** Tech Team
**最后更新：** 2025-10-28
