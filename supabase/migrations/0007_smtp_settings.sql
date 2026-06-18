-- SMTP config stored in the DB (managed from Admin → Settings).
-- Read only by Edge Functions via the service role. NOT exposed by /catalog.
create table if not exists public.smtp_settings (
  id          uuid primary key default gen_random_uuid(),
  host        text,
  port        int not null default 587,
  secure      boolean not null default false,   -- true=465 implicit TLS, false=587 STARTTLS
  username    text,
  password    text,
  from_email  text,
  from_name   text,
  created_at  timestamptz not null default now()
);

alter table public.smtp_settings enable row level security;
