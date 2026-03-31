-- Migration: Tambah mata_pelajaran dan update classes

-- Tabel mata pelajaran
create table if not exists mata_pelajaran (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  kode text,
  created_at timestamptz default now()
);

-- Update tabel classes: tambah kolom mata_pelajaran & tahun_ajaran
alter table classes add column if not exists mata_pelajaran_id uuid references mata_pelajaran(id);
alter table classes add column if not exists tahun_ajaran text default '2024/2025';
alter table classes add column if not exists jurusan text default 'RPL';

-- Update student_projects: tambah kolom mata_pelajaran & class
alter table student_projects add column if not exists mata_pelajaran_id uuid references mata_pelajaran(id);
alter table student_projects add column if not exists class_id uuid references classes(id);
alter table student_projects add column if not exists rejection_note text;
alter table student_projects add column if not exists submitted_at timestamptz;
alter table student_projects add column if not exists approved_at timestamptz;
alter table student_projects add column if not exists approved_by uuid references auth.users(id);

-- RLS untuk mata_pelajaran
alter table mata_pelajaran enable row level security;
create policy "Anyone can read mata_pelajaran" on mata_pelajaran for select using (true);
create policy "Admin can manage mata_pelajaran" on mata_pelajaran for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

-- RLS untuk classes
alter table classes enable row level security;
create policy "Anyone can read classes" on classes for select using (true);
create policy "Admin can manage classes" on classes for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin')
);

-- Seed mata pelajaran default
insert into mata_pelajaran (nama, kode) values
  ('Pemrograman Web', 'PWE'),
  ('Basis Data', 'BDT'),
  ('Pemrograman Berorientasi Objek', 'PBO'),
  ('Rekayasa Perangkat Lunak', 'RPL'),
  ('Proyek Kreatif dan Kewirausahaan', 'PKK'),
  ('Pemrograman Mobile', 'PMB')
on conflict do nothing;

-- Seed kelas default
insert into classes (name, jurusan, tahun_ajaran) values
  ('XI RPL 1', 'RPL', '2024/2025'),
  ('XI RPL 2', 'RPL', '2024/2025'),
  ('XII RPL 1', 'RPL', '2024/2025'),
  ('XII RPL 2', 'RPL', '2024/2025')
on conflict do nothing;
