#!/bin/bash

# 本地构建脚本 - 构建 Docker 镜像并导出为 tar.gz 文件
# 合并了版本管理、MD5校验、符号链接等功能

set -e

echo "🚀 开始构建技术能力评估系统 Docker 镜像..."

# 安全检查：确保 .env 文件不会被包含在镜像中
if ! grep -q "^\\.env" .dockerignore; then
    echo "❌ 错误：.dockerignore 文件中没有包含 .env"
    echo "这可能导致敏感信息被打包进 Docker 镜像！"
    echo "请检查 .dockerignore 文件"
    exit 1
fi

# 检查 .env.local 文件是否存在
if [ ! -f .env.local ]; then
    echo "❌ 错误：.env.local 文件不存在"
    echo "请创建 .env.local 文件并配置必要的环境变量"
    echo "参考 README.md 或 DEPLOYMENT.md 获取配置说明"
    exit 1
fi

# 构建时需要的 NEXT_PUBLIC_ 环境变量
echo "📋 加载构建时需要的环境变量..."
# 只导出 NEXT_PUBLIC_ 开头的变量
export $(grep -E '^NEXT_PUBLIC_' .env.local | xargs)

# 验证必需的环境变量
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误：缺少必需的环境变量"
    echo "请确保 .env.local 中包含："
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

# 从 package.json 提取版本号
VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')

if [ -z "$VERSION" ]; then
    echo "⚠️  无法从 package.json 提取版本号，使用时间戳"
    VERSION=$(date +%Y%m%d-%H%M%S)
fi

echo "📌 版本号: $VERSION"

# 构建 Docker 镜像
echo "📦 构建 Docker 镜像 (linux/amd64)..."
docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -t exam-system:$VERSION \
  -t exam-system:latest \
  .

echo "✅ 镜像构建完成！"

# 导出镜像到本地文件
echo "💾 导出镜像到本地文件..."

# 确保输出目录存在
OUTPUT_DIR="./docker-images"
mkdir -p "$OUTPUT_DIR"

# 导出镜像文件（压缩）
OUTPUT_FILE="$OUTPUT_DIR/exam-system-${VERSION}.tar.gz"
echo "📦 导出镜像到: $OUTPUT_FILE"
docker save exam-system:latest | gzip > "$OUTPUT_FILE"

# 显示文件信息
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "✅ 镜像已导出: $OUTPUT_FILE (大小: $FILE_SIZE)"

    # 生成 MD5 校验和
    echo "🔐 生成 MD5 校验和..."
    if command -v md5sum &> /dev/null; then
        MD5=$(md5sum "$OUTPUT_FILE" | awk '{print $1}')
        echo "$MD5  exam-system-${VERSION}.tar.gz" > "$OUTPUT_DIR/exam-system-${VERSION}.md5"
    elif command -v md5 &> /dev/null; then
        MD5=$(md5 -q "$OUTPUT_FILE")
        echo "$MD5  exam-system-${VERSION}.tar.gz" > "$OUTPUT_DIR/exam-system-${VERSION}.md5"
    fi

    if [ -n "$MD5" ]; then
        echo "✅ MD5 校验和: $MD5"
    fi

    # 创建 latest 符号链接方便使用
    cd "$OUTPUT_DIR"
    ln -sf "exam-system-${VERSION}.tar.gz" "exam-system-latest.tar.gz"
    if [ -f "exam-system-${VERSION}.md5" ]; then
        ln -sf "exam-system-${VERSION}.md5" "exam-system-latest.md5"
    fi
    cd - > /dev/null

    echo "✅ 已创建符号链接: $OUTPUT_DIR/exam-system-latest.tar.gz"
else
    echo "❌ 镜像导出失败"
    exit 1
fi

echo ""
echo "✅ 构建完成!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 下一步：上传镜像到服务器"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  上传镜像文件到服务器："
echo "   scp $OUTPUT_FILE user@your-server:/home/user/"
echo "   scp $OUTPUT_DIR/exam-system-${VERSION}.md5 user@your-server:/home/user/"
echo ""
echo "2️⃣  上传部署配置文件："
echo "   scp docker-compose.prod.yml user@your-server:/home/user/"
echo "   scp server-deploy.sh user@your-server:/home/user/"
echo ""
echo "3️⃣  SSH 登录到服务器并运行部署脚本："
echo "   ssh user@your-server"
echo "   cd /home/user"
echo "   chmod +x server-deploy.sh"
echo "   ./server-deploy.sh exam-system-${VERSION}.tar.gz"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 提示："
echo "   - 镜像文件: $OUTPUT_DIR/exam-system-${VERSION}.tar.gz"
echo "   - MD5 校验: $OUTPUT_DIR/exam-system-${VERSION}.md5"
echo "   - 版本号: $VERSION"
echo "   - 部署前请确保服务器上已配置 .env 文件"
echo ""
