# Repository Guidelines

## Project Structure & Module Organization
- `app/` hosts Next.js App Router routes; authentication flows live under `app/auth/*`, while gated content resides in `app/protected/`. Keep route layouts and loading states near their routes.
- `components/` contains reusable UI and auth widgets. Place shared primitives in `components/ui/` and higher-level screens or forms alongside related services.
- `lib/` centralizes Supabase clients (`lib/supabase/`) and utilities. Extend these helpers instead of instantiating new clients ad hoc. Keep global config files (`next.config.ts`, `tailwind.config.ts`, `middleware.ts`) minimal and document changes.

## Build, Test, and Development Commands
Use pnpm to stay aligned with the existing lockfile.
- `pnpm install` – Sync dependencies.
- `pnpm dev` – Launch the dev server with Turbopack at `http://localhost:3000`.
- `pnpm build` – Produce the production bundle.
- `pnpm start` – Serve the built app locally.
- `pnpm lint` – Run ESLint; apply fixes with `pnpm lint --fix` before opening a PR.

## Coding Style & Naming Conventions
- TypeScript with React 19 is the default; favor functional components and server actions where appropriate.
- Match existing file naming: kebab-case for files (`hero.tsx`), PascalCase for exported components, camelCase for functions and variables.
- Group Tailwind utility classes roughly layout → spacing → typography. Use `clsx` plus `tailwind-merge` instead of manual concatenation.
- ESLint (`eslint.config.mjs`) is the source of truth. Enable editor auto-fix and avoid untracked formatters.

## Testing Guidelines
- A formal testing harness is not yet configured. When adding tests, collocate unit specs as `*.test.ts(x)` or create a `tests/` directory for integration suites.
- Adopt Vitest or Playwright for Supabase auth coverage; document new tooling in the PR.
- Manually confirm login, password reset, and protected route access via `pnpm dev` until automation exists.

## Commit & Pull Request Guidelines
- Write imperative, scoped commits (e.g., `feat: add profile route guard`). Group unrelated changes into separate commits.
- Every PR should describe the change, note Supabase or environment updates, list test evidence (`pnpm lint`, manual checks), and attach UI screenshots when relevant.
- Reference GitHub issues when available and call out follow-up work explicitly to keep the backlog clear.

## Security & Configuration Tips
- Store Supabase keys in `.env.local`; never commit secrets. Document new variables in README and PRs.
- Review middleware and `lib/supabase/*` changes for SSR implications and confirm cookies and auth headers behave in both dev and production deployments before merging.
