import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Eye, Heart, Plus } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  draft: 'secondary',
  in_progress: 'default',
  submitted: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'Dalam Proses',
  submitted: 'Diajukan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export default async function MyProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()

  if (profile?.role !== 'siswa') redirect('/dashboard')

  const { data: projects } = await supabase
    .from('student_projects')
    .select(`*, project:projects(title, description), progress_logs(progress_percent)`)
    .eq('student_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Saya</h1>
        <Link href="/dashboard/my-projects/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Tambah Project</Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p>Belum ada project. Mulai buat project pertamamu!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => {
            const latestProgress = p.progress_logs?.sort((a: { progress_percent: number }, b: { progress_percent: number }) => b.progress_percent - a.progress_percent)[0]
            const progressPct = latestProgress?.progress_percent || 0

            return (
              <Card key={p.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{p.project?.title}</h3>
                        <Badge variant={statusColors[p.status] || 'secondary'}>
                          {statusLabels[p.status] || p.status}
                        </Badge>
                        {p.is_published && <Badge variant="success">Publik</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{p.project?.description}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progress</span>
                          <span>{progressPct}%</span>
                        </div>
                        <Progress value={progressPct} />
                      </div>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(p.views)}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {formatNumber(p.likes_count)}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/my-projects/${p.id}`}>
                      <Button variant="outline" size="sm">Detail</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
