# AI Interview Simulator — Improvement Roadmap

## 1) Current State (What this repo already does well)

- Clean learner flow: dashboard → topic/level selection → question session → AI evaluation → history analytics.
- Uses Supabase auth + row ownership checks in server actions.
- Uses structured schemas (`zod`) for AI output format control.
- Includes a polished UI that is already demo-friendly for YouTube.

## 2) Gaps That Limit Product Value Today

### Data model and source-of-truth gaps

- `topics` table exists, but the app still hardcodes topic metadata in `constants/topicList.tsx` (including UUIDs).
- Topic routing mismatch: some links use topic slug (`/topic/databases`) while retry in results uses UUID (`/topic/<topic_id>`).
- `attempts` status is free-text (`in_progress`, `completed`) without strong constraints.

### Product/UX gaps

- No timer, pause/resume, draft autosave, or anti-empty-answer validation.
- No attempt cancellation/retry policy.
- No onboarding path for first-time users (goal-setting, baseline test, recommended topics).
- History page shows analytics but no actionable drill-down by concept over time.

### AI quality and trust gaps

- No rubric transparency shown to users.
- No evaluation confidence / fallback behavior when model output quality is weak.
- No prompt versioning + no reproducibility metadata per attempt.

### Reliability and scaling gaps

- Heavy use of `.select("*")` and client fetches can overfetch.
- No background jobs/queue for slower evaluations.
- Limited observability: no structured logs/metrics/tracing and no model cost tracking.

### Go-to-market/content gaps

- README is still boilerplate and does not explain value, architecture, setup, demo data, or roadmap.
- No public benchmark/challenge mode to attract community participation.

---

## 3) High-Impact Improvements (Prioritized)

## Phase 1 — Foundation (1–2 weeks)

### A. Make `topics` table the single source of truth

**Why it matters:** enables admin-editable topics, easier growth, and less code churn.

- Move topic listing from `constants/topicList.tsx` to DB reads.
- Add columns: `slug` (unique), `description`, `icon_key`, `is_active`, `sort_order`.
- Replace `getTopicBySlug` constant lookup with DB query by slug.
- Keep a temporary fallback list for migration safety.

**Suggested SQL**

```sql
alter table public.topics
  add column if not exists slug text unique,
  add column if not exists description text,
  add column if not exists icon_key text,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 100;

create unique index if not exists topics_slug_idx on public.topics (slug);
```

### B. Normalize `attempts` lifecycle + performance indexes

**Why it matters:** clean business logic, better analytics, faster history queries.

- Enforce status check constraint (`in_progress`, `submitted`, `completed`, `failed`, `abandoned`).
- Add `started_at`, `completed_at`, `duration_seconds`.
- Add indexes for common filters:
  - `(user_id, created_at desc)`
  - `(user_id, topic_id, level, created_at desc)`

**Suggested SQL**

```sql
alter table public.attempts
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists completed_at timestamptz,
  add column if not exists duration_seconds integer,
  add constraint attempts_status_check
    check (status in ('in_progress','submitted','completed','failed','abandoned'));

create index if not exists attempts_user_created_idx
  on public.attempts (user_id, created_at desc);

create index if not exists attempts_user_topic_level_created_idx
  on public.attempts (user_id, topic_id, level, created_at desc);
```

### C. Fix routing and data consistency bugs

- Ensure all topic routes use slug consistently.
- Store both `topic_id` and a denormalized `topic_slug_snapshot` on attempt creation.
- Fix retry button in results to route with slug, not UUID.

### D. Upgrade README to product-grade documentation

- Add architecture diagram + data flow.
- Add env setup, Supabase schema migration instructions, and known limitations.
- Add “How scoring works” and “How to contribute”.

---

## Phase 2 — Learning Experience Differentiation (2–4 weeks)

### Status snapshot (April 29, 2026)

- ✅ Phase 2A shipped: answer constraints, optional voice response mode, adaptive follow-up calibration, role-based tracks + weakest concept simulator mode.
- ✅ Phase 2B shipped: per-question rubric categories, confidence score, evaluator notes, and next 7-day study sprint.
- ✅ Phase 2C shipped: concept mastery trend visuals, streaks, weekly summaries, completion goals, and weekly summary email draft flow.

### A. Better interview realism

- Add answer constraints: minimum character count, “thinking time”, and optional voice response mode.
- Add difficulty calibration: adaptive follow-up questions based on previous answer quality.
- Add role-based tracks (backend, frontend, data, ML, SRE).

### B. Stronger feedback artifacts

- Add per-question rubric categories: correctness, depth, clarity, tradeoff awareness.
- Add confidence score and evaluator notes.
- Generate “Next 7-day study sprint” with daily micro-goals.

### C. Progress intelligence

- Add concept mastery graph over time.
- Add streaks, completion goals, and weekly summary emails.
- Add “weakest concept simulator”: auto-generate attempts targeting weak areas.

---

## Phase 3 — Creator/Community Growth Engine (3–6 weeks)

### A. Public challenge mode

- Weekly challenge topic + shared leaderboard.
- Optional anonymous profile and shareable result card.
- This is very YouTube-friendly (community challenge episodes).

### B. Personal brand + virality hooks

- “Attempt replay” page with question-by-question walkthrough.
- Export a polished PDF report + public link.
- One-click social snippets: score badge, best concept gains, weekly streak.

### C. Team/B2B-lite mode

- Invite friends/cohort.
- Compare scores and consistency across topics.
- Admin dashboard with cohort-level weak concept heatmap.

---

## 4) AI System Hardening (Trust + Cost + Stability)

- Add prompt versioning table and store version in each attempt.
- Add model fallback policy (e.g., if primary fails, use secondary model).
- Add moderation/safety checks for generated content.
- Add token usage + cost logging per attempt.
- Add automated regression suite with fixed Q/A fixtures to detect scoring drift.

---

## 5) Security & Compliance Checklist

- Enforce RLS policies for `attempts` and `topics` read scope.
- Ensure no client can fetch other users’ attempt data.
- Add server-side validation for level enum and non-empty answers.
- Add audit columns (`created_by`, `updated_at`) where needed.
- Add data retention controls and “delete my data” flow.

---

## 6) YouTube Series Plan (High engagement)

1. **Episode 1:** From boilerplate to product vision (architecture + roadmap).
2. **Episode 2:** Database-first refactor (`topics` source-of-truth, attempts lifecycle).
3. **Episode 3:** AI scoring rubric design and prompt versioning.
4. **Episode 4:** Adaptive interview engine + mastery analytics.
5. **Episode 5:** Public challenge + leaderboard + shareable reports.
6. **Episode 6:** Production readiness (RLS, observability, costs, CI/CD).

Each episode should end with a measurable KPI (e.g., retention, attempts per user, completion rate, share rate).

---

## 7) Suggested KPI Dashboard (What to optimize)

- Activation: % users completing first attempt within 24h.
- Learning stickiness: attempts per weekly active user.
- Quality: average score variance by prompt version (lower unexplained variance is better).
- Progress: % users improving >=10 points in 3 attempts.
- Engagement: history page revisit rate.
- Growth: share-to-signup conversion from public result cards.

---

## 8) Immediate Next 10 Tasks (Execution queue)

1. Write SQL migrations for `topics` and `attempts` enhancements.
2. Replace hardcoded topic constants with DB-backed fetch layer.
3. Fix retry routing bug (UUID vs slug).
4. Add enums/validation for level and status in server actions.
5. Add empty-answer guardrails and minimum length checks.
6. Add prompt version + model metadata fields to attempts.
7. Add structured logger + request ID to server actions.
8. Implement attempt timing fields (`started_at`, `completed_at`, `duration_seconds`).
9. Add simple analytics events (attempt started/submitted/completed).
10. Replace boilerplate README with product and contributor docs.
