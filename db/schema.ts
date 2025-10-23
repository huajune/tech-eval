import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Example users table with common fields
 * This demonstrates a simple schema for user profiles beyond auth
 */
export const usersTable = pgTable("users_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Links to Supabase auth.users if needed
  authUserId: uuid("auth_user_id").unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Example posts table to demonstrate relationships
 */
export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  published: integer("published").default(0).notNull(), // 0 = draft, 1 = published
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
