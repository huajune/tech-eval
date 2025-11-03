import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * 健康检查端点
 * 用于 Docker 健康检查和监控系统
 * 不需要认证，检查数据库连接状态
 */
export async function GET() {
  try {
    // 检查数据库连接
    const startTime = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - startTime;

    // 返回健康状态
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "up",
            latency: `${dbLatency}ms`,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // 数据库连接失败
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "down",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      },
      { status: 503 }
    );
  }
}
