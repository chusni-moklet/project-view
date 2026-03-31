'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email.endsWith('@student.smktelkom-mlg.sch.id')) {
    redirect('/register?error=Email+harus+menggunakan+domain+%40student.smktelkom-mlg.sch.id')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`)

  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      name,
      email,
      role: 'siswa',
      is_verified: false,
    })
  }

  redirect('/pending-verification')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?error=Login+gagal')

  const { data: profile } = await supabase.from('users').select('role, is_verified').eq('id', user.id).single()
  if (!profile) redirect('/login?error=Profil+tidak+ditemukan.+Hubungi+admin.')

  if (profile.role === 'siswa' && !profile.is_verified) {
    redirect('/pending-verification')
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
