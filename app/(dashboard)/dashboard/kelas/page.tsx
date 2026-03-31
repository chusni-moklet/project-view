import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import KelasManager from '@/components/dashboard/KelasManager'

export default async function KelasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const [{ data: classes }, { data: mapel }] = await Promise.all([
    supabase.from('classes').select('*, mata_pelajaran(nama)').order('name'),
    supabase.from('mata_pelajaran').select('*').order('nama'),
  ])

  return (
    <div className="space-y-8">
      <KelasManager classes={classes || []} mataPelajaran={mapel || []} />
    </div>
  )
}
