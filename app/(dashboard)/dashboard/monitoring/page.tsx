import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import ProjectActions from '@/components/dashboard/ProjectActions'

const statusLabels: Record<string, string> = {
  draft: 'Draft', in_progress: 'Dalam Proses', submitted: 'Diajukan', approved: 'Disetujui', rejected: 'Ditolak',
}

export default async function MonitoringPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()

  if (!['guru', 'admin'].includes(profile?.role)) redirect('/dashboard')

  const { data: projects } = await supabase
    .from('student_projects')
    .select(`*, student:users(name, email), project:projects(title), progress_logs(progress_percent), mata_pelajaran(nama), class:classes(name)`)
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Project</h1>
        <p className="text-gray-500">Semua project siswa</p>
      </div>

      <div className="space-y-3">
        {!projects || projects.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">Belum ada project</CardContent></Card>
        ) : projects.map(p => {
          const maxProgress = p.progress_logs?.reduce((max: number, l: { progress_percent: number }) => Math.max(max, l.progress_percent), 0) || 0
          const isSubmitted = p.status === 'submitted'
          return (
            <Card key={p.id} className={isSubmitted ? 'border-yellow-300' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium truncate">{p.project?.title}</h3>
                      <Badge variant={isSubmitted ? 'warning' : 'secondary'}>{statusLabels[p.status] || p.status}</Badge>
                      {p.is_published && <Badge variant="success">Publik</Badge>}
                      {p.mata_pelajaran && <Badge variant="secondary">{p.mata_pelajaran.nama}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{p.student?.name} · {p.class?.name || '-'}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress</span><span>{maxProgress}%</span>
                      </div>
                      <Progress value={maxProgress} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <ProjectActions
                      projectId={p.id}
                      isPublished={p.is_published}
                      projectTitle={p.project?.title || ''}
                    />
                    <Link href={`/dashboard/monitoring/${p.id}`}>
                      <Button variant={isSubmitted ? 'default' : 'outline'} size="sm">
                        {isSubmitted ? 'Review' : 'Detail'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
