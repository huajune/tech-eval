import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * 用户表 - 关联Supabase Auth
 */
export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("candidate").notNull(), // 'candidate' | 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 考试模板表
 */
export const examsTable = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  role: varchar("role", { length: 50 }).notNull(), // 'frontend' | 'backend' | 'fullstack'
  language: varchar("language", { length: 50 }).notNull(), // 'typescript' | 'java' | 'python'
  framework: varchar("framework", { length: 100 }), // 'nextjs' | 'react' | 'spring' | 'django' | 'express'
  durationMinutes: integer("duration_minutes").default(10).notNull(),
  passingScore: integer("passing_score").default(60).notNull(),
  totalQuestions: integer("total_questions").default(20).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 题库表
 */
export const questionsTable = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'single' | 'multiple' | 'essay'
  options: jsonb("options"), // { "A": "选项A内容", "B": "...", "C": "...", "D": "..." }
  correctAnswer: jsonb("correct_answer"), // ['A'] 或 ['A', 'C'] 或 null(陈述题)
  abilityDimension: varchar("ability_dimension", { length: 50 }).notNull(),
  // 'code_design' | 'architecture' | 'database' | 'devops'
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // 'easy' | 'medium' | 'hard'
  weight: integer("weight").default(1).notNull(), // 选择题通常为1，陈述题为5
  applicableRoles: jsonb("applicable_roles").notNull(), // ['frontend', 'backend'] 或 ['fullstack']
  applicableLanguages: jsonb("applicable_languages"), // ['typescript'] 或 null(全语言通用)
  explanation: text("explanation"), // 答案解析
  referenceAnswer: text("reference_answer"), // 陈述题参考答案
  createdBy: uuid("created_by"), // 出题人（未来功能）
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 考试会话表
 */
export const examSessionsTable = pgTable("exam_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  examId: uuid("exam_id")
    .notNull()
    .references(() => examsTable.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).notNull().default("in_progress"),
  // 'in_progress' | 'completed' | 'terminated' (作弊强制结束)
  selectedQuestions: jsonb("selected_questions").notNull(), // [question_id, question_id, ...]
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  remainingSeconds: integer("remaining_seconds").default(600), // 剩余时间（用于恢复会话）
  cheatingWarnings: integer("cheating_warnings").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * 答案记录表
 */
export const answersTable = pgTable("answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => examSessionsTable.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questionsTable.id, { onDelete: "cascade" }),
  userAnswer: jsonb("user_answer"), // ['A'] 或 ['A', 'C'] 或 "essay text"
  isCorrect: boolean("is_correct"), // 选择题自动判定，陈述题为null
  manualScore: integer("manual_score"), // 陈述题人工评分 0-5
  gradedBy: uuid("graded_by"), // 评阅人ID（管理员）
  gradedAt: timestamp("graded_at"), // 评阅时间
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 作弊日志表
 */
export const cheatingLogsTable = pgTable("cheating_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => examSessionsTable.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  // 'page_blur' | 'tab_switch' | 'idle_timeout' | 'copy_paste'
  durationSeconds: integer("duration_seconds"), // 离开页面时长（tab_switch时有值）
  metadata: jsonb("metadata"), // 额外信息（如复制的文本内容）
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * 考试结果表
 */
export const examResultsTable = pgTable("exam_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .unique()
    .references(() => examSessionsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  totalScore: integer("total_score").notNull(), // 0-100
  abilityScores: jsonb("ability_scores").notNull(),
  // { "code_design": 80, "architecture": 70, "database": 85, "devops": 60 }
  estimatedLevel: varchar("estimated_level", { length: 20 }).notNull(), // 'P5' | 'P6' | 'P7' | 'P8' | 'P9'
  passStatus: boolean("pass_status").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});
