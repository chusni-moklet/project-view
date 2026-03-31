import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, password, class_id } = await req.json()

  if (!email.endsWith('@student.smktelkom-mlg.sch.id')) {
    return NextResponse.json({ error: 'Email harus domain @student.smktelkom-mlg.sch.id' }, { status: 400 })
  }

  const supabase = await createClient()

  // Sign up user
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data.user) return NextResponse.json({ error: 'Gagal membuat akun' }, { status: 500 })

  // Gunakan service role untuk bypass RLS saat insert profil
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: profileError } = await adminClient.from('users').insert({
    id: data.user.id,
    name,
    email,
    role: 'siswa',
    class_id: class_id || null,
    is_verified: false,
  })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
