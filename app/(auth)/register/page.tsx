import { createClient } from '@/lib/supabase/server'
import RegisterForm from '@/components/auth/RegisterForm'

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, tahun_ajaran, jurusan')
    .order('name')

  return <RegisterForm classes={classes || []} error={params?.error} />
}
