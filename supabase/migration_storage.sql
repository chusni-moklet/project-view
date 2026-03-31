-- Buat bucket untuk project screenshots
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images', 
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Hapus policy lama kalau ada
drop policy if exists "Public read project images" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can delete own files" on storage.objects;
drop policy if exists "Users can update own files" on storage.objects;

-- Policy: siapa saja bisa lihat (public bucket)
create policy "Public read project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

-- Policy: user authenticated bisa upload ke folder apapun
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'project-images' 
    and auth.uid() is not null
  );

-- Policy: user bisa update file
create policy "Users can update own files"
  on storage.objects for update
  using (
    bucket_id = 'project-images'
    and auth.uid() is not null
  );

-- Policy: user bisa hapus file
create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'project-images'
    and auth.uid() is not null
  );
