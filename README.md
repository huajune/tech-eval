# TechEval - 技术能力评估系统

基于 Next.js + Supabase 的在线技术测评平台，支持候选人考试、管理员评分与成绩管理。

## ✨ 核心能力

- 候选人：选择岗位与技术栈、进行限时考试、防作弊提醒、查看答题详情
- 管理员：集中查看成绩、人工评分简答题、复核候选人答题记录
- 系统：多次考试记录、会话恢复、暗黑模式

## ⚡ 快速上手

### 1. 克隆 & 安装

```bash
git clone <your-repo-url>
cd with-supabase-app
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入 Supabase 项目的 URL、匿名 Key 以及数据库连接串：

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
DATABASE_URL=postgresql://user:password@host:port/database
```

### 3. 初始化数据库

```bash
pnpm db:migrate       # 应用迁移
pnpm db:studio        # (可选) 查看数据
```

### 4. 自动同步 Supabase 用户（推荐）

在 Supabase SQL Editor 中执行 `supabase/migrations/create_user_trigger.sql`，确保新注册用户会写入 `public.users`。如暂未执行，首页会在用户首次访问时自动补齐该记录。

### 5. 创建管理员账号

```sql
UPDATE users
SET role = 'admin', profile_completed = true
WHERE email = 'admin@example.com';
```

### 6. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 🧰 常用命令

```bash
pnpm dev         # 开发
pnpm build       # 构建
pnpm start       # 生产环境启动
pnpm lint        # 代码检查

pnpm db:generate # 生成迁移
pnpm db:migrate  # 应用迁移
pnpm db:studio   # 浏览数据库
```

## 🐳 Docker 部署

本项目完整支持 Docker 容器化部署，适合部署到 Linux (Ubuntu) 服务器。

### 快速部署

```bash
# 1. 本地构建镜像（自动化脚本）
./build.sh

# 2. 上传到服务器并部署
# 详见 QUICK-START.md
```

### 部署文档

- **[QUICK-START.md](./QUICK-START.md)** - 5 分钟快速部署指南 ⚡
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 完整部署文档、运维命令和故障排查 📘

### 部署相关文件

| 文件                      | 说明                              |
| ------------------------- | --------------------------------- |
| `Dockerfile`              | Docker 镜像构建配置（多阶段构建） |
| `docker-compose.prod.yml` | 生产环境容器编排配置              |
| `.dockerignore`           | 构建时排除的文件列表              |
| `nginx.conf.example`      | Nginx 反向代理配置示例            |
| `build.sh`                | 本地构建脚本（自动化）            |
| `deploy-server.sh`        | 服务器部署脚本（自动化）          |

## 📁 项目结构

```
├─ app/                  # Next.js App Router 页面
├─ components/           # 可复用组件（含 UI 与业务组件）
├─ hooks/                # 自定义 Hooks
├─ lib/                  # Supabase 客户端、业务工具
├─ db/                   # Drizzle schema & client
├─ drizzle/              # 数据库迁移文件
├─ supabase/             # Supabase SQL 脚本
├─ docs/                 # PRD、API 契约、数据库设计文档
└─ example/              # 参考配置示例
```

## 📚 相关资料

- 产品、接口、数据库说明：见 `docs/`
- Supabase 触发器及回填脚本：见 `supabase/migrations/`

## 🤝 贡献

欢迎提交 Issue 或 PR，一起完善 TechEval！
