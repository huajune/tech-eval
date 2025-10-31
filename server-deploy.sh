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

# 检查 docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ 错误：Docker 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/engine/install/ubuntu/"
    exit 1
fi

# 检查 docker-compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ 错误：Docker Compose 未安装${NC}"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

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
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
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
    docker-compose -f docker-compose.prod.yml down
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

# 3. 清理旧镜像（保留最新的）
echo "🧹 清理旧镜像..."
docker image prune -f

# 4. 启动新容器
echo "🚀 启动容器..."
docker-compose -f docker-compose.prod.yml up -d

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
    docker-compose -f docker-compose.prod.yml ps
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # 显示日志
    echo "📋 最新日志（按 Ctrl+C 退出）："
    docker-compose -f docker-compose.prod.yml logs --tail=20 -f
else
    echo -e "${RED}❌ 容器启动失败${NC}"
    echo "查看日志："
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 常用命令："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  查看日志:"
echo "    docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "  查看状态:"
echo "    docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "  重启服务:"
echo "    docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "  停止服务:"
echo "    docker-compose -f docker-compose.prod.yml stop"
echo ""
echo "  停止并删除容器:"
echo "    docker-compose -f docker-compose.prod.yml down"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

