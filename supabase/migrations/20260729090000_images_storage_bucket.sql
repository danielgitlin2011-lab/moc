-- Image uploads move to Supabase Storage.
--
-- Uploads previously targeted Vercel Blob, which needs a separate token that
-- deployments do not have — every upload failed. The app already talks to
-- Supabase for everything else, so images now live in a Storage bucket that
-- ships with the project and needs no extra configuration.

----------------------------------------------------------------------
-- 1. The bucket
----------------------------------------------------------------------
-- Public read: uploaded photography is published on the customer's website,
-- so the URLs are meant to be visible. Size and MIME limits mirror the checks
-- in /api/uploads, enforced here so they hold even against direct Storage
-- calls with the anon key.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

----------------------------------------------------------------------
-- 2. Row-level security on the objects
----------------------------------------------------------------------
-- Every object is keyed `<user-id>/<uuid>.<ext>`. The first path segment is
-- the ownership test: a signed-in user can only write and delete inside their
-- own folder, and nobody can touch another account's images no matter what
-- URL or path they supply.

drop policy if exists "Public can view images" on storage.objects;
create policy "Public can view images"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "Users upload to their own folder" on storage.objects;
create policy "Users upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users delete from their own folder" on storage.objects;
create policy "Users delete from their own folder"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
