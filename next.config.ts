import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用 standalone 输出模式以支持 Docker 部署
  output: "standalone",
};

export default nextConfig;
