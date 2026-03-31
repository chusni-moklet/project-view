-- ============================================================
-- SEED: Insert ke tabel users setelah buat akun di Auth Dashboard
-- Jalankan SETELAH buat user di Authentication > Users
-- ============================================================

-- Admin: chusni@smktelkom-mlg.sch.id
insert into users (id, name, email, role, is_verified)
select id, 'Chusni Admin', 'chusni@smktelkom-mlg.sch.id', 'admin', true
from auth.users
where email = 'chusni@smktelkom-mlg.sch.id'
on conflict (email) do update set role = 'admin', is_verified = true;

-- Siswa Dummy: student@student.smktelkom-mlg.sch.id
insert into users (id, name, email, role, is_verified)
select id, 'Siswa Demo', 'student@student.smktelkom-mlg.sch.id', 'siswa', true
from auth.users
where email = 'student@student.smktelkom-mlg.sch.id'
on conflict (email) do update set role = 'siswa', is_verified = true;
