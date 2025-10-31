# 快速部署指南

## 准备工作

**本地环境**：
- Docker Desktop 已安装运行
- `.env.local` 文件已配置 Supabase 信息

**服务器环境**：
- Ubuntu Server 20.04+
- Docker 和 Docker Compose 已安装
- Nginx 已安装

## 三步部署

### 步骤 1：本地构建镜像

```bash
./build.sh
```

生成文件：
- `docker-images/exam-system-1.0.0.tar.gz` (镜像文件)
- `docker-images/exam-system-1.0.0.md5` (校验文件)

### 步骤 2：上传到服务器

```bash
# 上传镜像和校验文件
scp docker-images/exam-system-*.tar.gz user@server:/home/user/
scp docker-images/exam-system-*.md5 user@server:/home/user/

# 上传配置文件
scp docker-compose.prod.yml user@server:/home/user/
scp server-deploy.sh user@server:/home/user/

# 首次部署还需上传 Nginx 配置示例
scp nginx.conf.example user@server:/home/user/
```

### 步骤 3：服务器部署

```bash
# SSH 登录服务器
ssh user@server
cd /home/user

# 首次部署：创建环境变量文件
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
EOF

# 运行部署脚本
chmod +x server-deploy.sh
./server-deploy.sh exam-system-1.0.0.tar.gz
```

## 验证部署

```bash
# 检查容器状态
docker ps | grep exam-system

# 测试访问
curl http://localhost:3001

# 查看日志
docker logs exam-system --tail=50
```

## 配置 Nginx（首次部署必需）

```bash
# 复制并修改配置
sudo cp nginx.conf.example /etc/nginx/sites-available/exam-system
sudo nano /etc/nginx/sites-available/exam-system  # 修改域名

# 启用站点
sudo ln -s /etc/nginx/sites-available/exam-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 配置 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt update && sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

## 后续更新

代码更新后重复三步：

```bash
# 1. 本地构建
./build.sh

# 2. 上传镜像（使用新版本号）
scp docker-images/exam-system-1.0.1.tar.gz user@server:/home/user/
scp docker-images/exam-system-1.0.1.md5 user@server:/home/user/

# 3. 服务器部署
ssh user@server
cd /home/user
./server-deploy.sh exam-system-1.0.1.tar.gz
```

## 常用命令

```bash
# 实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 资源监控
docker stats exam-system
```

## 故障排查

**容器无法启动**：检查 `.env` 文件配置
**无法访问**：检查防火墙和 Nginx 配置
**数据库连接失败**：验证 `DATABASE_URL` 格式

详细文档见：`DEPLOYMENT.md`

## 安全提示

- 不要将 `.env` 文件提交到 Git
- 生产环境必须使用 HTTPS
- 定期备份数据库
- 保持 Docker 镜像和系统更新
