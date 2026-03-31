import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import AddProgressForm from '@/components/dashboard/AddProgressForm'
import SubmitProjectButton from '@/components/dashboard/SubmitProjectButton'
import ThumbnailUpload from '@/components/dashboard/ThumbnailUpload'

const statusLabels: Record<string, string> = {
  draft: 'Draft', in_progress: 'Dalam Proses', submitted: 'Menunggu Review',
  approved: 'Disetujui', rejected: 'Ditolak',
}
const statusColors: Record<string, string> = {
  draft: 'secondary', in_progress: 'default', submitted: 'warning',
  approved: 'success', rejected: 'destructive',
}

export default async function ProjectDetailDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sp } = await supabase
    .from('student_projects')
    .select(`
      *, 
      project:projects(*), 
      progress_logs(*, feedbacks(*, teacher:users(name))),
      mata_pelajaran(*),
      class:classes(name)
    `)
    .eq('id', id)
    .eq('student_id', user!.id)
    .single()

  if (!sp) notFound()

  const latestProgress = sp.progress_logs?.sort((a: { progress_percent: number }, b: { progress_percent: number }) => b.progress_percent - a.progress_percent)[0]
  const canSubmit = ['draft', 'in_progress', 'rejected'].includes(sp.status)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{sp.project?.title}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={(statusColors[sp.status] as 'default' | 'secondary' | 'success' | 'warning' | 'destructive') || 'secondary'}>
              {statusLabels[sp.status] || sp.status}
            </Badge>
            {sp.mata_pelajaran && <Badge variant="secondary">{sp.mata_pelajaran.nama}</Badge>}
            {sp.class && <Badge variant="secondary">{sp.class.name}</Badge>}
            {sp.is_published && <Badge variant="success">Publik di Katalog</Badge>}
          </div>
        </div>
        {canSubmit && <SubmitProjectButton projectId={id} />}
      </div>

      {/* Rejection note */}
      {sp.status === 'rejected' && sp.rejection_note && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-800">Catatan Penolakan:</p>
            <p className="text-sm text-red-700 mt-1">{sp.rejection_note}</p>
            <p className="text-xs text-red-500 mt-2">Perbaiki project kamu dan ajukan kembali.</p>
          </CardContent>
        </Card>
      )}

      {sp.status === 'submitted' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">Project kamu sedang dalam review oleh guru. Tunggu hasilnya ya!</p>
          </CardContent>
        </Card>
      )}

      {sp.status === 'approved' && sp.is_published && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-semibold text-green-800">Project kamu sudah tampil di katalog publik!</p>
            <p className="text-xs text-green-600 mt-0.5">Bagikan ke teman-teman kamu 🚀</p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-3">
          <p className="text-gray-600">{sp.project?.description}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Progress Keseluruhan</span>
              <span>{latestProgress?.progress_percent || 0}%</span>
            </div>
            <Progress value={latestProgress?.progress_percent || 0} />
          </div>
          {(sp.demo_url || sp.github_url) && (
            <div className="flex gap-3 pt-2">
              {sp.demo_url && <a href={sp.demo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">Demo →</a>}
              {sp.github_url && <a href={sp.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:underline">GitHub →</a>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hanya bisa update progress kalau belum submitted/approved */}
      {['draft', 'in_progress', 'rejected'].includes(sp.status) && (
        <>
          <ThumbnailUpload
            projectId={id}
            currentUrl={sp.screenshots?.find((s: { is_primary: boolean }) => s.is_primary)?.url}
          />
          <AddProgressForm studentProjectId={id} />
        </>
      )}

      {/* Progress logs */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Riwayat Progress</h2>
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
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{log.title}</h3>
                <span className="text-sm text-blue-600 font-medium">{log.progress_percent}%</span>
              </div>
              <p className="text-sm text-gray-600">{log.description}</p>
              <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString('id-ID')}</p>
              {log.feedbacks?.map(fb => (
                <div key={fb.id} className="bg-blue-50 rounded p-3 text-sm">
                  <p className="font-medium text-blue-800">{fb.teacher?.name}: <span className="font-normal">{fb.comment}</span></p>
                  <Badge variant={fb.status === 'approved' ? 'success' : fb.status === 'revision' ? 'warning' : 'secondary'} className="mt-1">
                    {fb.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
