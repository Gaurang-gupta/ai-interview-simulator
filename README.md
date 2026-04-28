# AI Interview Simulator

A Next.js + Supabase app that generates topic-based mock interview questions, evaluates free-form answers using AI, and tracks learning progress across attempts.

## What was implemented from the roadmap

### ✅ Phase 1 progress (implemented)

- **Database-first topic flow**
  - App now fetches topics from `topics` table (with safe fallback catalog).
  - Topic cards use DB slugs for routing.
- **Attempt lifecycle hardening**
  - Added SQL migration for status constraints, attempt timing fields, and indexes.
  - Added prompt/model metadata fields (`prompt_version`, `model_name`) and analytics JSON.
- **Routing/data consistency fix**
  - Retry flow now routes by topic slug snapshot instead of topic UUID.
- **Validation upgrades**
  - Server-side level validation via Zod enum.
  - Server/client answer minimum length validation.
- **Observability + analytics events**
  - Added structured request logger with request IDs.
  - Added attempt event logging (`attempt_started`, `attempt_completed`).

### 🚧 Remaining roadmap work

See the full roadmap and pending phases in:

- [`docs/project-improvement-roadmap.md`](docs/project-improvement-roadmap.md)

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4.
- **Backend:** Next.js Server Actions + Supabase Postgres/Auth.
- **AI:** AI SDK + Google Gemini via `@ai-sdk/google`.
- **Validation:** Zod schemas.

## Database

Current core tables:

- `topics`
- `attempts`
- `attempt_events` (new)

Migration added in:

- `supabase/migrations/20260425_phase1_schema.sql`

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_API_KEY=...
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run verify
```
