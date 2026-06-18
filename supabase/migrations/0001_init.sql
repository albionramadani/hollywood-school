-- =====================================================================
-- Hollywood School — initial schema
-- All access goes through Deno Edge Functions (service role).
-- RLS is enabled with NO public policies, so the anon key cannot read
-- tables directly; only the service role (used inside Edge Functions)
-- bypasses RLS.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- categories ----------
create table if not exists public.categories (
  id          text primary key,
  title       text not null,
  age         text,
  description text,
  about       text,
  highlights  text[] not null default '{}',
  image       text,
  sort        int not null default 0
);

-- ---------- courses ----------
create table if not exists public.courses (
  id          text primary key,
  category_id text references public.categories(id) on delete cascade,
  title       text not null,
  level       text,
  duration    text,
  schedule    text,
  description text,
  instructor  text,
  price       numeric not null default 0,
  seats       int not null default 0,
  cap         int not null default 0,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- summer programs ----------
create table if not exists public.summer_programs (
  id        text primary key,
  title     text not null,
  audience  text,
  duration  text,
  start     text,
  status    text,
  highlight boolean not null default false,
  price     numeric,
  sort      int not null default 0
);

-- ---------- testimonials ----------
create table if not exists public.testimonials (
  id        text primary key,
  name      text not null,
  initials  text,
  role      text,
  quote     text not null,
  rating    int not null default 5,
  category  text,
  featured  boolean not null default false,
  visible   boolean not null default true,
  sort      int not null default 0
);

-- ---------- media items ----------
create table if not exists public.media_items (
  id       text primary key,
  title    text not null,
  category text,
  video    boolean not null default false,
  image    text,
  sort     int not null default 0
);

-- ---------- registrations ----------
create table if not exists public.registrations (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  confirmation    text unique,
  contact_name    text not null,
  phone           text not null,
  email           text not null,
  student_name    text not null,
  dob             text not null,
  language        text,
  time_preference text,
  schedule        text,
  photo_consent   boolean not null default false,
  rules_consent   boolean not null default false,
  program_id      text,
  program_title   text,
  amount          numeric,
  payment_method  text,
  status          text not null default 'Pending'
);

create index if not exists registrations_created_at_idx on public.registrations (created_at desc);

-- ---------- settings (key/value) ----------
create table if not exists public.settings (
  key   text primary key,
  value text
);

-- ---------- lock everything down (functions use service role) ----------
alter table public.categories      enable row level security;
alter table public.courses         enable row level security;
alter table public.summer_programs enable row level security;
alter table public.testimonials    enable row level security;
alter table public.media_items     enable row level security;
alter table public.registrations   enable row level security;
alter table public.settings        enable row level security;
