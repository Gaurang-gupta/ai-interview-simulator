-- Phase 1 schema hardening for AI Interview Simulator

-- Topics improvements
alter table public.topics
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists icon_key text,
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 100;

create unique index if not exists topics_slug_idx on public.topics (slug);

-- Attempts lifecycle and metadata improvements
alter table public.attempts
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists completed_at timestamptz,
  add column if not exists duration_seconds integer,
  add column if not exists topic_slug_snapshot text,
  add column if not exists prompt_version text,
  add column if not exists model_name text,
  add column if not exists analytics_json jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attempts_status_check'
  ) then
    alter table public.attempts
      add constraint attempts_status_check
      check (status in ('in_progress', 'submitted', 'completed', 'failed', 'abandoned'));
  end if;
end $$;

create index if not exists attempts_user_created_idx
  on public.attempts (user_id, created_at desc);

create index if not exists attempts_user_topic_level_created_idx
  on public.attempts (user_id, topic_id, level, created_at desc);

-- Analytics events table
create table if not exists public.attempt_events (
  id uuid primary key default extensions.uuid_generate_v4(),
  attempt_id uuid not null references public.attempts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists attempt_events_attempt_idx
  on public.attempt_events (attempt_id, created_at desc);

create index if not exists attempt_events_user_idx
  on public.attempt_events (user_id, created_at desc);
