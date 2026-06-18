-- Public bucket for admin-uploaded images (category/media photos).
-- Public so the site can render them directly by URL. Uploads happen only
-- through the admin-gated `upload` Edge Function (service role).
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;
