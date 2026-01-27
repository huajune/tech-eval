ALTER TABLE "exams" ALTER COLUMN "language" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ALTER COLUMN "total_questions" SET DEFAULT 15;