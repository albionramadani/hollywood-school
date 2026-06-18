-- =====================================================================
-- Admin auth — server-side sessions (NOT JWT).
-- Passwords are PBKDF2-hashed. Sessions are opaque tokens stored here and
-- carried in an HttpOnly cookie. RLS on, no policies (functions use service role).
-- =====================================================================

create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.admin_sessions (
  token       text primary key,
  user_id     uuid not null references public.admin_users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null
);

create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at);

alter table public.admin_users    enable row level security;
alter table public.admin_sessions enable row level security;
