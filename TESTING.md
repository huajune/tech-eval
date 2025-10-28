# 测试指南 - TechEval MVP

## 🚀 当前已完成的功能

### 后端功能
- ✅ 数据库Schema（7张表）
- ✅ 种子数据（80道题目）
- ✅ 题目选择算法
- ✅ 核心API接口
  - `/api/exam/create-session` - 创建考试会话
  - `/api/exam/save-answer` - 保存答案
  - `/api/exam/submit` - 提交考试
- ✅ 自动评分引擎

### 前端功能
- ✅ 考试配置页面 `/exam/setup`

## 📋 测试步骤

### 第一步：确保环境配置正确

1. 确认开发服务器已启动：`pnpm dev`
2. 访问：http://localhost:3000
3. 确认可以看到首页和"开始考试"按钮

### 第二步：用户登录

**重要：必须先登录才能创建考试会话**

1. 点击右上角的"Sign in"或"Sign up"
2. 使用Supabase Auth注册/登录账号
3. 登录成功后，应该显示用户邮箱

### 第三步：测试考试配置页面

1. 点击"开始考试"按钮，或直接访问：http://localhost:3000/exam/setup
2. 选择配置：
   - 角色：选择"前端开发工程师"
   - 语言：选择"TypeScript"
   - 框架：选择"Next.js"
3. 点击"开始考试"按钮

### 第四步：验证API功能

#### 测试创建会话API

打开浏览器开发者工具（F12）→ Network标签

**预期结果：**
```json
{
  "sessionId": "uuid",
  "startTime": "2025-10-28T...",
  "durationMinutes": 10,
  "remainingSeconds": 600,
  "questions": [
    {
      "id": "uuid",
      "content": "题目内容",
      "type": "single",
      "options": { "A": "...", "B": "..." },
      "abilityDimension": "code_design"
    }
    // ... 共20题
  ]
}
```

**验证要点：**
- ✅ 返回了20道题目
- ✅ 题目中**没有**包含 `correctAnswer` 字段（安全脱敏）
- ✅ 题目中**没有**包含 `weight` 字段
- ✅ 题目中**没有**包含 `explanation` 字段
- ✅ 获得了 `sessionId`

#### 测试保存答案API（可选 - 使用Postman/curl）

```bash
curl -X POST http://localhost:3000/api/exam/save-answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "你的sessionId",
    "questionId": "某个题目的id",
    "userAnswer": ["B"]
  }'
```

**预期结果：**
```json
{
  "success": true,
  "isCorrect": true  // 如果答对了
}
```

#### 测试提交考试API（可选 - 使用Postman/curl）

```bash
curl -X POST http://localhost:3000/api/exam/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "你的sessionId"
  }'
```

**预期结果：**
```json
{
  "success": true,
  "redirectUrl": "/exam/sessionId/result",
  "result": {
    "totalScore": 85,
    "estimatedLevel": "P8",
    "passStatus": true
  }
}
```

## 🔍 检查数据库

### 使用Drizzle Studio

```bash
pnpm db:studio
```

然后访问：http://localhost:4983

**验证数据：**
1. **users表** - 应该有你登录的用户记录
2. **exams表** - 应该有6个考试模板
3. **questions表** - 应该有80道题目
4. **exam_sessions表** - 创建会话后应该有记录
5. **answers表** - 保存答案后应该有记录
6. **exam_results表** - 提交考试后应该有结果

### 使用SQL查询

在Supabase Dashboard的SQL Editor中：

```sql
-- 查看所有题目分布
SELECT
  ability_dimension,
  difficulty,
  type,
  COUNT(*) as count
FROM questions
GROUP BY ability_dimension, difficulty, type
ORDER BY ability_dimension, difficulty;

-- 查看考试会话
SELECT
  es.*,
  u.email,
  e.name as exam_name
FROM exam_sessions es
JOIN users u ON es.user_id = u.id
JOIN exams e ON es.exam_id = e.id
ORDER BY es.created_at DESC
LIMIT 10;

-- 查看考试结果
SELECT
  er.*,
  u.email,
  es.status
FROM exam_results er
JOIN users u ON er.user_id = u.id
JOIN exam_sessions es ON er.session_id = es.id
ORDER BY er.completed_at DESC
LIMIT 10;
```

## ⚠️ 常见问题

### 1. 创建会话失败："未登录"

**原因：** 没有登录Supabase Auth

**解决：** 点击右上角登录按钮，注册/登录账号

### 2. 创建会话失败："未找到匹配的考试模板"

**原因：** 选择的角色/语言组合没有对应的考试模板

**解决：** 选择以下组合之一：
- 前端 + TypeScript + Next.js
- 前端 + TypeScript + React
- 后端 + Java + Spring
- 后端 + Python + Django
- 后端 + TypeScript + Express
- 全栈 + TypeScript + Next.js

### 3. 创建会话失败："生成题目失败"

**原因：** 题库中没有符合条件的题目

**解决：**
1. 确认种子数据已导入：`pnpm db:seed`
2. 检查questions表是否有80条记录

### 4. API返回500错误

**原因：** 服务器错误

**解决：**
1. 查看终端的错误日志
2. 检查DATABASE_URL环境变量是否配置正确
3. 确认数据库连接正常

## ✅ 功能验收清单

### API安全性验证
- [ ] 创建会话API返回的题目中**没有**答案信息
- [ ] 未登录用户无法调用API（返回401）
- [ ] 无法访问他人的会话（修改sessionId返回403）

### 题目分布验证
- [ ] 每次创建会话生成的题目数量为20题
- [ ] 题目包含：18道选择题 + 2道简答题
- [ ] 题目按难度分布：11易 + 7中 + 2难
- [ ] 每个维度5题（代码设计、软件架构、数据库建模、运维能力）

### 数据库验证
- [ ] exam_sessions表记录创建正确
- [ ] selected_questions字段包含20个题目ID
- [ ] startTime和remainingSeconds正确
- [ ] 题目答案保存到answers表
- [ ] 提交后exam_results表有结果记录

### 评分验证
- [ ] 选择题自动判分正确
- [ ] 简答题is_correct为null，等待人工评分
- [ ] 总分计算正确（加权平均）
- [ ] 职级映射正确（P5-P9）

## 🎯 MVP功能已全部完成！

✅ **所有功能已实现：**

1. ✅ **答题页面** `/exam/[sessionId]/page.tsx`
   - 题目显示和答题交互（单选、多选、简答）
   - 题目导航（答题卡显示已答/未答状态）
   - 实时保存答案
   - 10分钟倒计时，时间到自动提交

2. ✅ **防作弊监控** `hooks/use-anti-cheat.ts`
   - 页面失焦检测（3次警告后终止考试）
   - Tab切换警告
   - 空闲超时提醒（5分钟无操作）
   - 禁用右键菜单和复制功能
   - 所有作弊行为记录到数据库

3. ✅ **结果报告页面** `/exam/[sessionId]/result/page.tsx`
   - 总分和职级展示（P5-P9）
   - 通过/未通过状态
   - 能力维度得分（代码设计、软件架构、数据库、运维）
   - 用时统计

4. ✅ **答案解析页面** `/exam/[sessionId]/answers/page.tsx`
   - 显示所有题目和正确答案
   - 用户答案对比
   - 详细解析说明
   - 简答题参考答案

5. ✅ **管理员评阅界面** `/admin/grading/page.tsx`
   - 查看待评分的简答题
   - 显示考生答案和参考答案
   - 提供0-5分评分功能
   - 评分后自动重新计算总分和职级

## 📍 所有页面路由

- `/` - 首页，点击"开始考试"按钮
- `/exam/setup` - 考试配置页（选择角色/语言/框架）
- `/exam/[sessionId]` - 答题页面
- `/exam/[sessionId]/result` - 结果报告页
- `/exam/[sessionId]/answers` - 答案解析页
- `/admin/grading` - 管理员评阅界面

## 🔑 完整测试流程

### 考生流程：
1. 访问首页，登录账号
2. 点击"开始考试" → 选择技术栈 → 开始答题
3. 答题页面：回答20道题目，实时保存
4. 提交考试 → 查看结果报告
5. 点击"查看答案解析"查看详细解析

### 管理员流程：
1. 访问 `/admin/grading` 查看待评分的简答题
2. 为每道简答题打分（0-5分）
3. 提交评分后，系统自动重新计算考生总分和职级

---

## 🔒 安全测试（重要！）

### SQL注入防护测试

尝试使用非法参数创建考试会话：

```bash
curl -X POST http://localhost:3000/api/exam/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "role": "\"; DROP TABLE users;--",
    "language": "typescript"
  }'
```

**预期结果：** 返回错误 `无效的角色参数`

### 跨会话答题防护测试

1. 创建两个不同的考试会话，获取sessionId1和sessionId2
2. 从sessionId2的题目列表中获取一个questionId
3. 尝试在sessionId1中提交该questionId的答案

```bash
curl -X POST http://localhost:3000/api/exam/save-answer \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session1的ID",
    "questionId": "session2的某个题目ID",
    "userAnswer": ["A"]
  }'
```

**预期结果：** 返回错误 `无效的题目ID，该题目不属于本次考试`

### 简答题评分逻辑测试

1. 完成一次考试（包含2道简答题）
2. 提交后立即查看结果页
3. **验证：** 总分应该只包含选择题的分数，简答题未计入
4. 访问 `/admin/grading` 为简答题评分
5. 重新访问结果页
6. **验证：** 总分已更新，包含简答题得分

### 题库不足测试（仅开发环境）

1. 备份数据库
2. 删除部分题目（如删除code_design的easy难度题目，使其少于3道）
3. 尝试创建考试会话

**预期结果：** 返回错误 `题库不足，无法生成考试`

4. 恢复数据库备份

---

## 📊 已修复的安全问题清单

### 第一轮修复（SECURITY-FIXES.md）
- ✅ **SQL注入防护** - 所有用户输入参数通过白名单校验 + 参数化查询
- ✅ **跨会话答题防护** - 验证questionId必须属于当前会话的selectedQuestions
- ✅ **简答题评分逻辑** - 未评分时不计入分母，避免错误扣分
- ✅ **题目数量校验** - 题库不足时终止会话创建，确保每次恰好20题
- ✅ **防作弊监控** - 3次警告后自动终止，记录所有可疑行为

### 第二轮修复（SECURITY-FIXES-ROUND2.md）
- ✅ **cheating_logs字段映射** - 修复字段名与schema不匹配问题
- ✅ **管理员鉴权** - pending-grading和submit-score仅限管理员访问
- ✅ **服务端计时+心跳** - 每30秒心跳同步，时间到强制提交
- ✅ **字段名修复** - user.name改为user.fullName

### 第三轮修复（SECURITY-FIXES-ROUND3.md）
- ✅ **自动提交评分** - heartbeat和session API自动提交时调用评分，避免404
- ✅ **服务端警告统计** - exam_sessions.cheating_warnings统计，3次强制终止
- ✅ **防作弊规则** - tab_switch 3次终止，阻止右键和复制，其他事件只记录

详细修复报告见：`SECURITY-FIXES.md`、`SECURITY-FIXES-ROUND2.md` 和 `SECURITY-FIXES-ROUND3.md`

---

## ⚠️ 防作弊规则说明

### 会导致终止考试的行为
- **切换标签页/窗口** - 3次警告后强制终止考试（严格模式）
  - 第1次：警告提示 (1/3)
  - 第2次：最后警告 (2/3)
  - 第3次：立即终止，跳转首页

### 会被禁止但不计警告
- **右键菜单** - 完全禁用，但不计入警告次数
- **复制功能** - 完全禁用，但不计入警告次数
- **粘贴功能** - 除简答题textarea外禁用，不计入警告次数

### 只记录不影响考试
- **页面失焦** - 记录日志，不警告，不终止
- **空闲超时** - 记录日志，不警告，不终止

---

## 🔄 服务端心跳测试

### 测试心跳机制

1. 开始一次考试
2. 打开浏览器DevTools → Network标签
3. 观察每30秒发送一次 `POST /api/exam/heartbeat`
4. 查看响应：
```json
{
  "remainingSeconds": 570,  // 剩余秒数
  "status": "in_progress"
}
```

### 测试自动提交

1. 等待10分钟（或修改代码设置更短的时间用于测试）
2. **验证：** 不会弹出confirm确认框
3. **验证：** 自动跳转到结果页
4. **验证：** 数据库中session.status = "completed"

### 测试时间篡改防护

1. 修改客户端代码尝试延长时间
2. **验证：** 心跳每30秒会重置为服务端时间
3. **验证：** 10分钟后仍然强制提交

---

## 👨‍💼 管理员功能测试

### 设置管理员权限

在数据库中运行（或使用Drizzle Studio）：

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

### 测试管理员鉴权

**普通用户访问：**
1. 以普通用户身份登录
2. 访问 `/admin/grading`
3. **预期：** 返回403错误 "权限不足，仅限管理员访问"

**管理员访问：**
1. 以管理员身份登录
2. 访问 `/admin/grading`
3. **预期：** 正常显示待评分列表
4. 为简答题评分
5. **验证：** 评分成功，总分已更新

---

**测试愉快！如有问题请查看终端日志或浏览器控制台。** 🚀
