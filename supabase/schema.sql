-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Classes
create table classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  teacher_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Users (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'siswa' check (role in ('admin', 'guru', 'siswa')),
  class_id uuid references classes(id),
  is_verified boolean default false,
  verified_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Student Projects
create table student_projects (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  status text default 'draft' check (status in ('draft', 'in_progress', 'submitted', 'approved', 'rejected')),
  final_score numeric,
  is_published boolean default false,
  published_at timestamptz,
  beneficiary_name text,
  beneficiary_type text,
  location_name text,
  demo_url text,
  github_url text,
  views integer default 0,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- Project Screenshots
create table project_screenshots (
  id uuid primary key default uuid_generate_v4(),
  student_project_id uuid references student_projects(id) on delete cascade,
  url text not null,
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- Project Likes
create table project_likes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references student_projects(id) on delete cascade,
  user_id uuid references auth.users(id),
  ip_address text,
  created_at timestamptz default now(),
  unique(project_id, user_id),
  unique(project_id, ip_address)
);

-- Progress Logs
create table progress_logs (
  id uuid primary key default uuid_generate_v4(),
  student_project_id uuid references student_projects(id) on delete cascade,
  title text not null,
  description text,
  progress_percent integer default 0 check (progress_percent between 0 and 100),
  created_at timestamptz default now()
);

-- Feedbacks
create table feedbacks (
  id uuid primary key default uuid_generate_v4(),
  progress_id uuid references progress_logs(id) on delete cascade,
  teacher_id uuid references users(id),
  comment text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'revision')),
  created_at timestamptz default now()
);

-- Rubrics
create table rubrics (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  weight numeric default 1,
  created_at timestamptz default now()
);

-- Scores
create table scores (
  id uuid primary key default uuid_generate_v4(),
  student_project_id uuid references student_projects(id) on delete cascade,
  rubric_id uuid references rubrics(id) on delete cascade,
  score numeric not null,
  comment text,
  created_at timestamptz default now()
);

-- RPC: increment views
create or replace function increment_views(project_id uuid)
returns void as $$
  update student_projects set views = views + 1 where id = project_id;
$$ language sql security definer;

-- RPC: weekly ranking
create or replace function get_weekly_ranking()
returns table (
  id uuid, student_id uuid, project_id uuid, status text,
  is_published boolean, published_at timestamptz,
  beneficiary_name text, beneficiary_type text, location_name text,
  demo_url text, github_url text, views integer, likes_count integer,
  final_score numeric, created_at timestamptz,
  ranking_score bigint
) as $$
  select
    sp.id, sp.student_id, sp.project_id, sp.status,
    sp.is_published, sp.published_at,
    sp.beneficiary_name, sp.beneficiary_type, sp.location_name,
    sp.demo_url, sp.github_url, sp.views, sp.likes_count,
    sp.final_score, sp.created_at,
    (sp.likes_count * 3 + sp.views)::bigint as ranking_score
  from student_projects sp
  where sp.is_published = true
    and sp.published_at >= now() - interval '7 days'
  order by ranking_score desc
  limit 10;
$$ language sql security definer;

-- RLS Policies
alter table users enable row level security;
alter table student_projects enable row level security;
alter table progress_logs enable row level security;
alter table feedbacks enable row level security;
alter table project_likes enable row level security;
alter table project_screenshots enable row level security;

-- Users: read own, guru/admin read all
create policy "Users can read own profile" on users for select using (auth.uid() = id);
create policy "Guru/admin can read all users" on users for select using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('guru', 'admin'))
);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Allow insert on register" on users for insert with check (auth.uid() = id);
create policy "Service role bypass" on users using (true);

-- Student projects: public read if published
create policy "Public can read published projects" on student_projects for select using (is_published = true);
create policy "Students can read own projects" on student_projects for select using (auth.uid() = student_id);
create policy "Guru/admin can read all projects" on student_projects for select using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('guru', 'admin'))
);
create policy "Students can insert own projects" on student_projects for insert with check (auth.uid() = student_id);
create policy "Students can update own projects" on student_projects for update using (auth.uid() = student_id);
create policy "Guru/admin can update any project" on student_projects for update using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('guru', 'admin'))
);

-- Progress logs
create policy "Students can manage own progress" on progress_logs for all using (
  exists (select 1 from student_projects sp where sp.id = student_project_id and sp.student_id = auth.uid())
);
create policy "Guru/admin can read all progress" on progress_logs for select using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('guru', 'admin'))
);

-- Feedbacks
create policy "Guru/admin can manage feedbacks" on feedbacks for all using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('guru', 'admin'))
);
create policy "Students can read own feedbacks" on feedbacks for select using (
  exists (
    select 1 from progress_logs pl
    join student_projects sp on sp.id = pl.student_project_id
    where pl.id = progress_id and sp.student_id = auth.uid()
  )
);

-- Project likes: anyone can insert, users can delete own
create policy "Anyone can like" on project_likes for insert with check (true);
create policy "Users can unlike own" on project_likes for delete using (auth.uid() = user_id);
create policy "Anyone can read likes" on project_likes for select using (true);

-- Screenshots: public read
create policy "Public can read screenshots" on project_screenshots for select using (true);
create policy "Students can manage own screenshots" on project_screenshots for all using (
  exists (select 1 from student_projects sp where sp.id = student_project_id and sp.student_id = auth.uid())
);
