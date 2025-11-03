#!/bin/bash

# 服务器端部署脚本 - 加载 Docker 镜像并启动服务
# 在 Ubuntu 服务器上运行

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 开始部署 Exam System..."

# 检查是否提供了镜像文件参数
if [ -z "$1" ]; then
    echo -e "${RED}❌ 错误：请提供镜像文件路径${NC}"
    echo "用法: $0 <镜像文件.tar.gz>"
    echo "示例: $0 exam-system-1.0.0.tar.gz"
    exit 1
fi

IMAGE_FILE="$1"

# 检查镜像文件是否存在
if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}❌ 错误：镜像文件不存在: $IMAGE_FILE${NC}"
    exit 1
fi

# 检查可用磁盘空间
echo "💾 检查磁盘空间..."
REQUIRED_SPACE=2048  # MB
DOCKER_DIR="/var/lib/docker"
if [ -d "$DOCKER_DIR" ]; then
    AVAILABLE_SPACE=$(df "$DOCKER_DIR" | awk 'NR==2 {print int($4/1024)}')
else
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print int($4/1024)}')
fi

if [ $AVAILABLE_SPACE -lt $REQUIRED_SPACE ]; then
    echo -e "${RED}❌ 错误：磁盘空间不足${NC}"
    echo "   需要: ${REQUIRED_SPACE}MB"
    echo "   可用: ${AVAILABLE_SPACE}MB"
    echo "   建议: 清理旧的 Docker 镜像或增加磁盘空间"
    exit 1
fi
echo -e "${GREEN}✅ 磁盘空间充足 (可用: ${AVAILABLE_SPACE}MB)${NC}"

# 检查 docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误：Docker 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/engine/install/ubuntu/"
    exit 1
fi

# 检查 docker-compose 是否安装（支持新旧两种命令格式）
DOCKER_COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ 错误：Docker Compose 未安装${NC}"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo "✅ 使用 Docker Compose 命令: $DOCKER_COMPOSE_CMD"

# 检查 docker-compose.prod.yml 是否存在
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ 错误：未找到 docker-compose.prod.yml 文件${NC}"
    echo "请先上传 docker-compose.prod.yml 到当前目录"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  警告：未找到 .env 文件${NC}"
    echo "请创建 .env 文件并配置以下环境变量："
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - DATABASE_URL"
    echo ""
    read -p "是否继续？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 验证 MD5 校验和（如果存在）
MD5_FILE="${IMAGE_FILE%.tar.gz}.md5"
if [ -f "$MD5_FILE" ]; then
    echo "🔐 验证镜像完整性..."
    if command -v md5sum &> /dev/null; then
        md5sum -c "$MD5_FILE"
    elif command -v md5 &> /dev/null; then
        EXPECTED_MD5=$(cat "$MD5_FILE" | awk '{print $1}')
        ACTUAL_MD5=$(md5 -q "$IMAGE_FILE")
        if [ "$EXPECTED_MD5" = "$ACTUAL_MD5" ]; then
            echo -e "${GREEN}✅ MD5 校验通过${NC}"
        else
            echo -e "${RED}❌ MD5 校验失败！${NC}"
            exit 1
        fi
    fi
fi

# 1. 停止并删除旧容器（如果存在）
if docker ps -a | grep -q exam-system; then
    echo "🛑 停止旧容器..."
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down
fi

# 2. 加载新镜像
echo "📦 加载 Docker 镜像..."
FILE_SIZE=$(ls -lh "$IMAGE_FILE" | awk '{print $5}')
echo "   镜像文件: $IMAGE_FILE (大小: $FILE_SIZE)"

if [[ "$IMAGE_FILE" == *.tar.gz ]]; then
    # 解压并加载
    gunzip -c "$IMAGE_FILE" | docker load
elif [[ "$IMAGE_FILE" == *.tar ]]; then
    # 直接加载
    docker load -i "$IMAGE_FILE"
else
    echo -e "${RED}❌ 错误：不支持的文件格式${NC}"
    echo "支持的格式: .tar.gz 或 .tar"
    exit 1
fi

# 验证镜像已加载
if docker images | grep -q exam-system; then
    echo -e "${GREEN}✅ 镜像加载成功${NC}"
else
    echo -e "${RED}❌ 镜像加载失败${NC}"
    exit 1
fi

# 3. 清理 exam-system 旧镜像（保留 latest 标签）
echo "🧹 清理旧镜像..."
# 只删除 exam-system 的 <none> 标签镜像
docker images | grep exam-system | grep '<none>' | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true

# 4. 启动新容器
echo "🚀 启动容器..."
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d

# 5. 等待健康检查
echo "⏳ 等待服务启动..."
sleep 10

# 6. 检查容器状态
if docker ps | grep -q exam-system; then
    echo -e "${GREEN}✅ 容器启动成功！${NC}"

    # 显示容器信息
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 容器状态："
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml ps
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # 显示最新日志（不阻塞）
    echo "📋 最新日志（最近 50 行）："
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs --tail=50
    echo ""
else
    echo -e "${RED}❌ 容器启动失败${NC}"
    echo "查看日志："
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 常用命令："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  实时查看日志:"
echo "    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs -f"
echo ""
echo "  查看状态:"
echo "    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml ps"
echo ""
echo "  重启服务:"
echo "    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml restart"
echo ""
echo "  停止服务:"
echo "    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml stop"
echo ""
echo "  停止并删除容器:"
echo "    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

