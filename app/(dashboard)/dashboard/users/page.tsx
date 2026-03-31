import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsersClient from '@/components/dashboard/UsersClient'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: users }, { data: classes }] = await Promise.all([
    supabase
      .from('users')
      .select('*, class:classes(id, name, tahun_ajaran)')
      .order('is_verified', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase.from('classes').select('id, name, tahun_ajaran').order('name'),
  ])

  return <UsersClient users={users || []} classes={classes || []} currentUserId={user!.id} />
}
