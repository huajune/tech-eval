import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';

// Load Next.js environment variables (.env.local, .env, etc.)
loadEnvConfig(process.cwd());

export default defineConfig({
  out: './drizzle',
  schema: './db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
