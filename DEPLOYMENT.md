# Docker 部署指南

本文档提供了技术能力评估系统的完整 Docker 部署流程。

## 📋 前置要求

### 本地开发机器

- Docker Desktop（用于构建镜像）
- Node.js 18+
- pnpm

### 生产服务器（Ubuntu）

- Docker Engine
- Docker Compose
- Nginx
- 已配置的 Supabase 实例

## 🔧 部署步骤

### 🚀 快速部署（推荐）

我们提供了自动化脚本简化部署流程：

#### 方式一：使用自动化脚本（最简单）

**本地机器：**

```bash
# 1. 确保 .env.local 文件已配置
# 2. 运行构建脚本
./build.sh
```

**服务器端：**

```bash
# 1. 上传镜像和配置文件后，运行部署脚本
./deploy-server.sh
```

这两个脚本会自动完成所有步骤，包括安全检查、环境变量验证、镜像构建/加载和健康检查。

#### 方式二：完整部署流程（使用脚本）

**步骤 1：本地构建**

```bash
# 运行构建脚本
./build.sh

# 脚本会：
# - 检查 .dockerignore 安全性
# - 验证 .env.local 配置
# - 构建 Docker 镜像
# - 导出为 tar.gz 文件到 ./docker-images/ 目录
```

**步骤 2：上传到服务器**

```bash
# 上传镜像文件
scp docker-images/exam-system-latest.tar.gz user@your-server:/tmp/

# 上传配置文件
scp docker-compose.prod.yml user@your-server:/opt/exam-system/
scp deploy-server.sh user@your-server:/opt/exam-system/
scp nginx.conf.example user@your-server:/opt/exam-system/
```

**步骤 3：服务器配置**

```bash
# SSH 登录服务器
ssh user@your-server

# 进入部署目录
cd /opt/exam-system

# 创建环境变量文件
nano .env
# 填入所需的环境变量（见下方配置示例）

# 赋予脚本执行权限
chmod +x deploy-server.sh
```

**步骤 4：运行部署**

```bash
# 运行部署脚本
./deploy-server.sh

# 脚本会自动：
# - 检查必需文件和环境变量
# - 加载 Docker 镜像
# - 停止旧容器（如果存在）
# - 启动新容器
# - 执行健康检查
# - 显示容器状态和日志
```

**服务器端 .env 文件示例：**

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 数据库配置
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?sslmode=require

# 应用配置
NODE_ENV=production
```

---

### 📝 手动部署（详细步骤）

如果你想了解每一步的细节，或者脚本无法满足需求，可以按照以下手动步骤操作：

### 第一步：本地构建 Docker 镜像

1. **准备环境变量**

确保 `.env.local` 文件已配置，包含构建时需要的环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

2. **构建镜像**

```bash
# 加载环境变量
export $(grep -E '^NEXT_PUBLIC_' .env.local | xargs)

# 构建镜像（支持 linux/amd64 平台，适用于 Ubuntu 服务器）
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
  -t exam-system:latest \
  .
```

3. **保存镜像为文件**

```bash
# 保存为压缩文件（更小，传输更快）
docker save exam-system:latest | gzip > exam-system.tar.gz

# 或者保存为普通 tar 文件
# docker save exam-system:latest -o exam-system.tar
```

### 第二步：上传镜像到服务器

使用 `scp` 或其他方式上传到服务器：

```bash
scp exam-system.tar.gz user@your-server:/home/user/
```

### 第三步：服务器端加载镜像

SSH 登录到服务器后：

```bash
# 加载镜像
docker load < exam-system.tar.gz

# 或者如果是 tar 文件
# docker load -i exam-system.tar

# 验证镜像已加载
docker images | grep exam-system
```

### 第四步：配置环境变量

在服务器上创建 `.env` 文件：

```bash
cd /path/to/deployment
nano .env
```

添加以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 数据库连接（用于 Drizzle ORM）
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

### 第五步：上传 docker-compose 配置

将 `docker-compose.prod.yml` 上传到服务器：

```bash
scp docker-compose.prod.yml user@your-server:/path/to/deployment/
```

### 第六步：启动容器

```bash
cd /path/to/deployment

# 启动服务（后台运行）
docker-compose -f docker-compose.prod.yml up -d

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 检查容器状态
docker-compose -f docker-compose.prod.yml ps
```

### 第七步：配置 Nginx

1. **复制 Nginx 配置**

```bash
# 复制配置文件
sudo cp nginx.conf.example /etc/nginx/sites-available/exam-system

# 修改配置中的域名和端口
sudo nano /etc/nginx/sites-available/exam-system

# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/exam-system /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

2. **配置防火墙（如果使用 ufw）**

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 确保容器端口（3001）不对外开放
# 只允许本地访问
```

### 第八步：配置 SSL 证书（推荐）

使用 Let's Encrypt 配置免费 SSL 证书：

```bash
# 安装 certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 获取证书（会自动配置 Nginx）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

## 🔄 更新部署

当需要更新应用时：

1. **本地构建新镜像**

```bash
# 使用新的版本标签
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
  -t exam-system:v1.1.0 \
  .
```

2. **保存并上传新镜像**

```bash
docker save exam-system:v1.1.0 | gzip > exam-system-v1.1.0.tar.gz
scp exam-system-v1.1.0.tar.gz user@your-server:/home/user/
```

3. **服务器端更新**

```bash
# 加载新镜像
docker load < exam-system-v1.1.0.tar.gz

# 更新 docker-compose.prod.yml 中的镜像版本
# image: exam-system:v1.1.0

# 重启服务
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 运维命令

### 查看日志

```bash
# 实时查看所有日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看最近 100 行日志
docker-compose -f docker-compose.prod.yml logs --tail=100

# 只查看特定服务的日志
docker logs exam-system
```

### 容器管理

```bash
# 停止服务
docker-compose -f docker-compose.prod.yml stop

# 启动服务
docker-compose -f docker-compose.prod.yml start

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止并删除容器
docker-compose -f docker-compose.prod.yml down

# 查看容器状态
docker-compose -f docker-compose.prod.yml ps

# 进入容器
docker exec -it exam-system sh
```

### 资源监控

```bash
# 查看容器资源使用情况
docker stats exam-system

# 查看容器详细信息
docker inspect exam-system
```

### 清理

```bash
# 清理未使用的镜像
docker image prune -a

# 清理停止的容器
docker container prune

# 清理未使用的卷
docker volume prune
```

## 🔍 故障排查

### 容器无法启动

1. 检查环境变量是否正确配置
2. 查看容器日志：`docker logs exam-system`
3. 检查端口是否被占用：`sudo netstat -tlnp | grep 3001`

### 无法访问应用

1. 检查容器是否运行：`docker ps`
2. 检查健康检查状态：`docker inspect exam-system | grep Health`
3. 测试容器内部是否正常：`curl http://localhost:3001`
4. 检查 Nginx 配置和日志：`sudo nginx -t` 和 `sudo tail -f /var/log/nginx/error.log`

### 数据库连接问题

1. 验证 `DATABASE_URL` 格式是否正确
2. 确认服务器可以访问 Supabase（检查防火墙规则）
3. 测试数据库连接：在容器内运行 `psql $DATABASE_URL`

### 性能问题

1. 检查资源使用：`docker stats`
2. 调整 `docker-compose.prod.yml` 中的资源限制
3. 查看 Nginx 日志分析请求瓶颈

## 📝 注意事项

1. **安全性**

   - 永远不要将 `.env` 文件提交到 Git
   - 定期更新 Docker 镜像和系统包
   - 使用 HTTPS 保护生产环境
   - 限制数据库连接权限

2. **备份**

   - 定期备份数据库
   - 保存镜像的多个版本以便回滚
   - 备份 `.env` 配置文件

3. **监控**

   - 设置应用监控（如 Sentry、DataDog）
   - 配置日志收集系统
   - 设置服务器资源告警

4. **端口配置**
   - 默认映射到宿主机 3001 端口
   - 可在 `docker-compose.prod.yml` 中修改
   - 确保 Nginx 配置中的端口与之匹配

## 🆘 获取帮助

如遇到问题，请检查：

1. Docker 和 Docker Compose 版本是否符合要求
2. 服务器系统资源是否充足
3. 网络连接是否正常
4. 环境变量配置是否完整
