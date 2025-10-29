# TechEval - 技术能力评估系统

全面评估应聘者的技术能力，包括代码设计、软件架构、数据库建模和运维能力等多个维度。

## ✨ 功能特性

### 候选人功能
- 🔐 **用户认证**：基于 Supabase Auth 的安全登录注册
- 📝 **在线考试**：10分钟限时考试，20道题目（18道选择题 + 2道简答题）
- 🎯 **技术栈选择**：支持前端/后端/全栈岗位，TypeScript/Java/Python语言
- ⏱️ **倒计时功能**：实时显示剩余时间，自动提交
- 🚫 **防作弊检测**：页面失焦、标签切换、复制粘贴监控
- 📊 **考试结果**：查看答题详情和解析（分数对候选人不可见）

### 管理员功能
- ✍️ **简答题评分**：人工评分简答题，支持小数分（如4.5分）
- 📈 **成绩查看**：查看所有候选人的完整成绩和能力评级
- 🔍 **答案详情**：查看候选人的所有答题记录和解析
- 📋 **待评分管理**：集中管理所有待评分的简答题

### 系统特性
- ♻️ **多次考试**：支持同一用户多次参加考试，记录所有历史成绩
- 💾 **会话恢复**：考试中刷新页面可恢复进度（限时内）
- 🎨 **暗黑模式**：支持亮色/暗色主题切换
- 📱 **响应式设计**：适配各种屏幕尺寸

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **语言**: TypeScript
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **样式**: Tailwind CSS
- **认证**: [Supabase Auth](https://supabase.com/docs/guides/auth)
- **数据库**: PostgreSQL (via Supabase)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **部署**: Vercel (推荐)

## 📦 快速开始

### 前置要求

- Node.js 18+
- pnpm (推荐) / npm / yarn
- Supabase 账号

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd with-supabase-app
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入以下信息：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# 数据库连接 (用于 Drizzle)
DATABASE_URL=postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1
```

> 💡 提示：
> - 在 [Supabase Dashboard](https://supabase.com/dashboard) 创建项目
> - API 设置页面获取 URL 和 Key
> - 数据库设置页面获取连接字符串（建议使用 Session mode）

### 4. 初始化数据库

```bash
# 生成迁移文件（如果有schema变更）
pnpm db:generate

# 应用数据库迁移
pnpm db:migrate

# （可选）打开 Drizzle Studio 查看数据
pnpm db:studio
```

### 5. 创建管理员账号

数据库迁移后，需要手动设置管理员：

```sql
-- 在 Supabase SQL Editor 中执行
UPDATE users
SET role = 'admin', profile_completed = true
WHERE email = 'admin@example.com';
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📂 项目结构

```
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── admin/           # 管理员API
│   │   ├── exam/            # 考试相关API
│   │   └── user/            # 用户相关API
│   ├── admin/               # 管理员页面
│   ├── auth/                # 认证页面
│   ├── exam/                # 考试页面
│   └── page.tsx             # 首页
├── components/              # React组件
│   └── ui/                  # shadcn/ui组件
├── db/                      # 数据库
│   ├── index.ts             # Drizzle实例
│   └── schema.ts            # 数据库Schema
├── drizzle/                 # 数据库迁移文件
├── lib/                     # 工具函数
│   ├── exam/                # 考试相关逻辑
│   └── supabase/            # Supabase客户端
└── CLAUDE.md                # AI开发指南
```

## 🗄️ 数据库设计

### 核心表结构

- **users** - 用户表（关联 Supabase Auth）
- **exams** - 考试模板表
- **questions** - 题库表
- **exam_sessions** - 考试会话表
- **answers** - 答案记录表
- **exam_results** - 考试结果表
- **cheating_logs** - 作弊日志表

### 关系图

```
User (1) ──→ (N) ExamSession (1) ──→ (1) ExamResult
                    │
                    └──→ (N) Answer
                    └──→ (N) CheatingLog

Exam (1) ──→ (N) ExamSession

Question (1) ──→ (N) Answer
```

详细Schema定义见 `db/schema.ts`

## 🔧 开发命令

```bash
# 开发
pnpm dev              # 启动开发服务器（使用 Turbopack）
pnpm build            # 构建生产版本
pnpm start            # 启动生产服务器
pnpm lint             # 运行 ESLint（添加 --fix 自动修复）

# 数据库
pnpm db:generate      # 生成迁移文件
pnpm db:migrate       # 应用迁移
pnpm db:push          # 直接推送schema（仅开发环境）
pnpm db:studio        # 打开 Drizzle Studio
```

## 🎯 核心业务流程

### 候选人考试流程

1. 注册/登录账号
2. 填写姓名和手机号
3. 选择应聘岗位、编程语言和框架
4. 开始10分钟限时考试
5. 提交考试（自动或手动）
6. 等待管理员评分简答题
7. 查看答题详情和解析

### 管理员评分流程

1. 登录管理员账号
2. 访问"待评分管理"页面
3. 查看候选人简答题答案
4. 根据参考答案和评分标准打分
5. 提交评分，系统自动计算总分和能力评级
6. 在"考试结果查看"页面查看所有成绩

## 📊 评分规则

### 选择题（自动评分）
- 单选题/多选题：答对得1分，答错得0分

### 简答题（人工评分）
- 权重：通常为5分（可配置）
- 评分范围：0 到题目权重（支持小数，如4.5）
- 评分维度：代码设计、架构、数据库、运维

### 总分计算
```
总分 = (各维度得分 / 各维度总分) * 100
```

### 能力评级
- P5: 60-69分
- P6: 70-79分
- P7: 80-89分
- P8: 90-95分
- P9: 96-100分

## 🔐 角色权限

### Candidate（候选人）
- ✅ 参加考试
- ✅ 查看答题详情
- ❌ 查看分数和评级
- ❌ 查看其他人的成绩

### Admin（管理员）
- ✅ 查看所有候选人的完整成绩
- ✅ 评分简答题
- ✅ 查看所有考试详情
- ❌ 参加考试

## 🚀 部署

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（同 `.env.local`）
4. 部署完成

### 环境变量

确保在 Vercel 项目设置中添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

## 🧪 题库管理

题目定义在代码中（未来可迁移到数据库）：

```typescript
// lib/exam/question-bank.ts
export const questionBank: Question[] = [
  {
    id: "...",
    content: "题目内容",
    type: "single" | "multiple" | "essay",
    options: { A: "...", B: "...", C: "...", D: "..." },
    correctAnswer: ["A"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    // ...
  }
];
```

## 📝 待办事项

- [ ] 添加题库管理后台
- [ ] 导出考试成绩为Excel
- [ ] 考试统计和数据可视化
- [ ] 邮件通知功能
- [ ] 考试时间灵活配置

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Built with ❤️ using Next.js and Supabase
