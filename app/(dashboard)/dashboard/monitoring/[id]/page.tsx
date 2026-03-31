import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import FeedbackForm from '@/components/dashboard/FeedbackForm'
import ProjectReviewActions from '@/components/dashboard/ProjectReviewActions'

const statusLabels: Record<string, string> = {
  draft: 'Draft', in_progress: 'Dalam Proses', submitted: 'Menunggu Review',
  approved: 'Disetujui', rejected: 'Ditolak',
}

export default async function MonitoringDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()

  if (!['guru', 'admin'].includes(profile?.role)) redirect('/dashboard')

  const { data: sp } = await supabase
    .from('student_projects')
    .select(`
      *, 
      student:users(name, email), 
      project:projects(title, description), 
      progress_logs(*, feedbacks(*, teacher:users(name))),
      mata_pelajaran(*),
      class:classes(name)
    `)
    .eq('id', id)
    .single()

  if (!sp) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{sp.project?.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{sp.student?.name} · {sp.student?.email}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary">{statusLabels[sp.status] || sp.status}</Badge>
            {sp.mata_pelajaran && <Badge variant="secondary">{sp.mata_pelajaran.nama}</Badge>}
            {sp.class && <Badge variant="secondary">{sp.class.name}</Badge>}
            {sp.is_published && <Badge variant="success">Publik</Badge>}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {sp.status === 'approved' && sp.is_published && (
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">✅ Tampil di Katalog</span>
          )}
        </div>
      </div>

      {/* Review actions — hanya tampil kalau status submitted */}
      {sp.status === 'submitted' && (
        <ProjectReviewActions projectId={id} />
      )}

      {sp.rejection_note && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-800">Catatan Penolakan:</p>
            <p className="text-sm text-red-700">{sp.rejection_note}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <p className="text-gray-600 text-sm">{sp.project?.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
            {sp.beneficiary_name && <div><span className="text-gray-500">Penerima:</span> {sp.beneficiary_name}</div>}
            {sp.location_name && <div><span className="text-gray-500">Lokasi:</span> {sp.location_name}</div>}
            {sp.demo_url && <div><a href={sp.demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Demo →</a></div>}
            {sp.github_url && <div><a href={sp.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline">GitHub →</a></div>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Log Progress</h2>
        {(!sp.progress_logs || sp.progress_logs.length === 0) && (
          <p className="text-gray-400 text-sm">Belum ada log progress</p>
        )}
        {sp.progress_logs?.sort((a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).map((log: {
          id: string; title: string; description: string; progress_percent: number; created_at: string;
          feedbacks?: Array<{ id: string; comment: string; status: string; teacher?: { name: string } }>
        }) => (
          <Card key={log.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{log.title}</h3>
                <span className="text-blue-600 font-medium text-sm">{log.progress_percent}%</span>
              </div>
              <p className="text-sm text-gray-600">{log.description}</p>
              <Progress value={log.progress_percent} />
              <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString('id-ID')}</p>
              {log.feedbacks?.map(fb => (
                <div key={fb.id} className="bg-gray-50 rounded p-2 text-sm">
                  <span className="font-medium">{fb.teacher?.name}:</span> {fb.comment}
                  <Badge variant={fb.status === 'approved' ? 'success' : 'warning'} className="ml-2">{fb.status}</Badge>
                </div>
              ))}
              <FeedbackForm progressId={log.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
