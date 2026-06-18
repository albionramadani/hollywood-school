-- Store generated invoice PDFs in Supabase Storage (private bucket).
-- Functions use the service role to upload and to mint signed URLs, so no
-- public policies are needed.
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

alter table public.registrations add column if not exists invoice_path text;
