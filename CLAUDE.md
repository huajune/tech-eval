# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15+ starter with Supabase authentication using cookie-based sessions. Built with React 19, TypeScript, and Tailwind CSS with shadcn/ui components.

## Development Commands

```bash
# Install dependencies (use pnpm to match lockfile)
pnpm install

# Run development server with Turbopack at http://localhost:3000
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code (apply fixes with --fix before commits)
pnpm lint

# Database commands (Drizzle ORM)
pnpm db:generate    # Generate migration files from schema
pnpm db:migrate     # Apply migrations to database
pnpm db:push        # Push schema changes directly (dev only)
pnpm db:studio      # Open Drizzle Studio (database GUI)
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL` - From project API settings
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Publishable or anon key
- `DATABASE_URL` - PostgreSQL connection string from Supabase Database settings (use Session mode for development)

## Architecture

### Supabase Client Pattern

Three distinct Supabase client implementations for different contexts:

1. **Server Components** (`lib/supabase/server.ts`): Uses `createServerClient` with Next.js `cookies()`. MUST create fresh client in each function - never store in global variables (critical for Fluid compute).

2. **Client Components** (`lib/supabase/client.ts`): Uses `createBrowserClient` for browser-side operations. All auth forms use this client directly with "use client" directive.

3. **Middleware** (`lib/supabase/middleware.ts`): Session refresh via `updateSession()`. Creates new client per request. Handles cookie synchronization between browser and server.

### Authentication Flow

- **Middleware** (`middleware.ts:4-6`): Calls `updateSession()` on every request except static assets. Redirects unauthenticated users to `/auth/login` when accessing protected routes.
- **Protected routes**: Live under `/app/protected/*`. Layout at `app/protected/layout.tsx` renders navigation and auth UI.
- **Auth pages**: Located in `/app/auth/*` - login, sign-up, forgot-password, update-password, error pages.
- **Client-side auth**: Forms use "use client" directive with browser Supabase client for direct auth operations (see `components/login-form.tsx:1,31`).

### Component Organization

- `components/ui/` - shadcn/ui primitives (button, input, card, etc.). Configured via `components.json` with "new-york" style.
- `components/*` - Auth forms (login-form, sign-up-form, etc.) and app-specific UI (hero, theme-switcher, auth-button).
- `components/tutorial/` - Onboarding tutorial steps for connecting Supabase and signing up users.

### Path Aliases

TypeScript paths configured in `tsconfig.json:26-30`:
- `@/` maps to project root
- Common aliases: `@/components`, `@/lib`, `@/lib/utils`

## Key Implementation Details

### Middleware Session Management

`lib/supabase/middleware.ts:47-48` calls `getClaims()` to refresh session. This MUST happen immediately after client creation - any code between `createServerClient` and `getClaims()` can cause random logouts.

When modifying middleware responses:
1. Pass request to `NextResponse.next({ request })`
2. Copy cookies: `myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())`
3. Never modify cookies directly or sessions will break

### Server Component Pattern

Always create fresh Supabase client per request in server components:

```typescript
// Correct - new client each time
async function MyServerComponent() {
  const supabase = await createClient();
  // use supabase
}
```

Never store in module-level variables or the client will be reused across requests.

## Styling

- Tailwind CSS with "new-york" shadcn/ui theme and `cssVariables: true`
- Dark mode via `next-themes` - toggle in `components/theme-switcher.tsx`
- Utility functions: `lib/utils.ts` exports `cn()` for class merging with `clsx` + `tailwind-merge`

## Adding Features

### New Auth Routes
Place in `app/auth/*` alongside existing auth pages. Reference middleware redirect logic in `lib/supabase/middleware.ts:50-60`.

### Protected Pages
Add under `app/protected/*` to inherit authentication checks from middleware. Use server component pattern to access user session.

### New UI Components
Run `npx shadcn@latest add <component>` to add shadcn/ui components. They'll be installed to `components/ui/` with proper aliases.

### Database Operations

**Drizzle ORM** (`db/` directory):
- Schema definitions in `db/schema.ts` using Drizzle's type-safe schema builder
- Database client in `db/index.ts` - imports postgres-js driver and creates Drizzle instance
- Migration files in `drizzle/` directory (auto-generated)

**Important Drizzle patterns**:
1. Always import `{ db }` from `@/db` - don't create new clients
2. For Supabase transaction pooling mode, uncomment `{ prepare: false }` in `db/index.ts`
3. Use `pnpm db:push` for quick schema iteration in development
4. Use `pnpm db:generate` + `pnpm db:migrate` for production migrations

Example query:
```typescript
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

// Insert
await db.insert(schema.usersTable).values({ name: "John", email: "[email protected]" });

// Select
const users = await db.select().from(schema.usersTable);

// Update
await db.update(schema.usersTable).set({ name: "Jane" }).where(eq(schema.usersTable.id, userId));
```

**Auth Integration**:
- Supabase Auth (`@/lib/supabase/*`) handles authentication/sessions
- Drizzle ORM (`@/db`) handles application data queries
- Link tables to auth users via `auth_user_id` foreign key to `auth.users`
