# 安全与逻辑问题修复报告

## 修复日期
2025-10-28

## 问题概述
根据代码审查反馈，修复了4个关键安全和逻辑问题。

---

## ✅ 问题1：SQL注入风险

### 问题描述
`lib/exam/exam-generator.ts:95-103` 使用 `sql.raw` 直接拼接用户输入的 `role` 和 `language` 参数到JSONB查询中，存在SQL注入风险。

### 原代码
```typescript
sql`${questionsTable.applicableRoles} @> ${sql.raw(
  `'["${config.role}"]'::jsonb`
)}`
```

### 修复方案
1. **添加白名单枚举校验**
```typescript
const VALID_ROLES = ["frontend", "backend", "fullstack"] as const;
const VALID_LANGUAGES = ["typescript", "java", "python"] as const;

function validateConfig(config: ExamConfig): void {
  if (!VALID_ROLES.includes(config.role)) {
    throw new Error(`无效的角色参数: ${config.role}`);
  }
  if (!VALID_LANGUAGES.includes(config.language)) {
    throw new Error(`无效的编程语言参数: ${config.language}`);
  }
}
```

2. **使用参数化查询**
```typescript
// 在查询前先调用校验
validateConfig(config);

// 使用JSON.stringify代替sql.raw
sql`${questionsTable.applicableRoles} @> ${JSON.stringify([config.role])}::jsonb`
```

### 影响
防止恶意用户通过构造特殊字符串注入SQL语句，确保数据库安全。

---

## ✅ 问题2：questionId验证缺失

### 问题描述
`app/api/exam/save-answer/route.ts` 在保存答案时只验证了会话归属，没有确认 `questionId` 是否属于该会话的 `selectedQuestions`。恶意用户可以提交其他题目的答案占用满分。

### 修复方案
在保存答案前添加交叉验证：

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

### 影响
防止用户提交不属于当前考试的题目答案，杜绝跨会话作弊。

---

## ✅ 问题3：简答题评分逻辑错误

### 问题描述
`lib/exam/scoring.ts:84-87` 对未人工评分的简答题直接将分数设为0但分母仍加5，导致未评阅状态下总分被错误扣减。

### 原代码
```typescript
const manualScore = answer.manualScore ?? 0;
abilityScores[dimension].score += manualScore;
abilityScores[dimension].total += 5; // 简答题满分5分
```

**问题：** 当 `manualScore` 为 `null` 时，得分为0但分母仍为5，会拉低总分。

### 修复方案
```typescript
// 简答题：只有已人工评分时才计入总分
if (answer.manualScore !== null) {
  abilityScores[dimension].score += answer.manualScore;
  abilityScores[dimension].total += 5; // 简答题满分5分
}
// manualScore为null时跳过，既不计入分子也不计入分母
```

### 影响
- 未评分的简答题不会影响当前总分
- 人工评分后，系统会重新计算总分
- 符合PRD中"简答题待评阅"的要求

---

## ✅ 问题4：题目数量不足处理不当

### 问题描述
`lib/exam/exam-generator.ts:141-146` 当某个维度题库不足时仅记录 `console.warn`，但继续执行，导致 `selectedQuestions` 可能少于20题，分布也会失衡。

### 原代码
```typescript
if (pool.length < count) {
  console.warn(`警告：${dimension} - ${difficulty} 题目不足`);
  // 如果题目不足，全部选中
  selected.push(...pool);
}
```

### 修复方案
1. **收集错误信息**
```typescript
const errors: string[] = [];

if (pool.length < count) {
  errors.push(
    `${dimension} - ${difficulty} 题目不足：需要${count}题，实际${pool.length}题`
  );
  selected.push(...pool);
}
```

2. **抛出错误终止会话创建**
```typescript
// 如果有题目不足的情况，抛出错误终止会话创建
if (errors.length > 0) {
  throw new Error(`题库不足，无法生成考试：\n${errors.join('\n')}`);
}

// 验证题目数量（必须恰好20题）
if (selected.length !== 20) {
  throw new Error(`题目数量错误：需要20题，实际生成${selected.length}题`);
}
```

### 影响
- 确保每次考试恰好包含20道题
- 题库不足时会及时返回错误，不会创建不完整的考试会话
- 提醒管理员补充题库

---

## ✅ 问题5：缺失的API和页面（已在上一轮实现）

### 审查时提到的缺失功能
- `/api/exam/log-cheating` ✅ 已实现
- `/api/exam/terminate` ✅ 已实现
- `/api/exam/session/[sessionId]` ✅ 已实现
- 答题页面 `/exam/[sessionId]/page.tsx` ✅ 已实现
- 结果报告页 `/exam/[sessionId]/result/page.tsx` ✅ 已实现
- 答案解析页 `/exam/[sessionId]/answers/page.tsx` ✅ 已实现
- 管理员评分界面 `/admin/grading/page.tsx` ✅ 已实现
- 防作弊监控 `hooks/use-anti-cheat.ts` ✅ 已实现

### 说明
所有核心功能已在本次开发中实现完毕，符合MVP需求。

---

## 🔒 安全加固总结

### 输入验证
- ✅ 所有用户输入参数通过白名单校验
- ✅ 使用参数化查询代替字符串拼接
- ✅ 服务端验证题目归属关系

### 业务逻辑
- ✅ 题目数量严格校验（必须20题）
- ✅ 简答题评分逻辑符合业务需求
- ✅ 防止跨会话答题作弊

### 防作弊机制
- ✅ 3次警告后自动终止考试
- ✅ 页面失焦/Tab切换检测
- ✅ 空闲超时检测（5分钟）
- ✅ 禁用复制粘贴和右键菜单
- ✅ 所有可疑行为记录到数据库

---

## 📋 测试建议

### 安全测试
1. **SQL注入测试**
   - 尝试提交非法role/language值（如：`"; DROP TABLE users;--`）
   - 预期：返回"无效的角色参数"错误

2. **跨会话答题测试**
   - 获取另一个会话的questionId
   - 尝试在当前会话中提交该答案
   - 预期：返回"无效的题目ID"错误

### 业务逻辑测试
1. **简答题评分测试**
   - 提交考试后，查看未评分时的总分
   - 人工评分后，验证总分是否正确重新计算
   - 预期：未评分时总分只包含选择题，评分后包含简答题

2. **题库不足测试**
   - 删除部分题目使某维度题目少于分布策略要求
   - 尝试创建考试会话
   - 预期：返回"题库不足，无法生成考试"错误

---

## 📝 后续优化建议

1. **添加API限流**
   - 虽然PRD中说暂不实现，但建议生产环境添加
   - 防止暴力攻击和资源滥用

2. **审计日志**
   - 记录所有安全相关事件
   - 便于追溯和分析异常行为

3. **前端参数校验**
   - 在前端也添加相同的枚举校验
   - 提供更好的用户体验

4. **题库管理界面**
   - 允许管理员查看各维度题目数量
   - 提醒题库不足的维度

---

**修复完成，所有关键安全和逻辑问题已解决。** ✅
