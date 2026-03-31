'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

export default function ProjectReviewActions({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [note, setNote] = useState('')

  async function approve() {
    setLoading('approve')
    await fetch(`/api/student-projects/${projectId}/approve`, { method: 'POST' })
    setLoading(null)
    router.refresh()
  }

  async function reject() {
    if (!note.trim()) { alert('Tulis catatan penolakan terlebih dahulu'); return }
    setLoading('reject')
    await fetch(`/api/student-projects/${projectId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    setLoading(null)
    setShowReject(false)
    router.refresh()
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium text-yellow-800">Project ini menunggu review kamu</p>
        {!showReject ? (
          <div className="flex gap-2">
            <Button
              onClick={approve}
              disabled={!!loading}
              className="gap-2 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle className="h-4 w-4" />
              {loading === 'approve' ? 'Memproses...' : 'Setujui'}
            </Button>
            <Button
              onClick={() => setShowReject(true)}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Tolak
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Tulis alasan penolakan dan saran perbaikan..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={reject} disabled={!!loading} variant="destructive" size="sm">
                {loading === 'reject' ? 'Menolak...' : 'Kirim Penolakan'}
              </Button>
              <Button onClick={() => setShowReject(false)} variant="ghost" size="sm">Batal</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
