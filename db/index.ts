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
 */

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create PostgreSQL connection
// If using Supabase transaction pooling, uncomment the prepare: false option
const client = postgres(process.env.DATABASE_URL, {
  // prepare: false, // Uncomment for Supabase transaction pooling
});

// Create Drizzle instance with schema
export const db = drizzle({ client, schema });

// Export schema for use in queries
export { schema };
