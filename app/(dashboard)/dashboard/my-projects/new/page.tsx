import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewProjectForm from '@/components/dashboard/NewProjectForm'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role, class_id').eq('id', user!.id).single()
  if (profile?.role !== 'siswa') redirect('/dashboard')

  const [{ data: mapel }, classResult] = await Promise.all([
    supabase.from('mata_pelajaran').select('id, nama, kode').order('nama'),
    profile?.class_id
      ? supabase.from('classes').select('id, name, tahun_ajaran').eq('id', profile.class_id).single()
      : Promise.resolve({ data: null }),
  ])

  return (
    <NewProjectForm
      classes={[]}
      mataPelajaran={mapel || []}
      defaultClassId={profile?.class_id}
      defaultClassName={classResult.data ? `${classResult.data.name}${classResult.data.tahun_ajaran ? ` (${classResult.data.tahun_ajaran})` : ''}` : undefined}
    />
  )
}
