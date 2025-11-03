import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database client for Drizzle ORM
 *
 * IMPORTANT: For Supabase connection pooling (transaction mode),
 * set { prepare: false } to disable prepared statements.
 *
 * Connection modes:
 * - Session mode: Use default settings
 * - Transaction mode: Add { prepare: false }
 *
 * NOTE: Database connection is lazy-initialized on first use.
 * This allows Next.js to build without DATABASE_URL being set.
 */

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  // Only check and connect at runtime
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Create PostgreSQL connection
  // If using Supabase transaction pooling, uncomment the prepare: false option
  const client = postgres(process.env.DATABASE_URL, {
    // prepare: false, // Uncomment for Supabase transaction pooling
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    max_lifetime: 60 * 30, // Close connections after 30 minutes
    connect_timeout: 10, // Connection timeout in seconds
  });

  // Create Drizzle instance with schema
  cachedDb = drizzle({ client, schema });
  return cachedDb;
}

// Export a Proxy that initializes the database on first access
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    const actualDb = getDb();
    const value = actualDb[prop as keyof typeof actualDb];
    return typeof value === "function" ? value.bind(actualDb) : value;
  },
});

// Export schema for use in queries
export { schema };
