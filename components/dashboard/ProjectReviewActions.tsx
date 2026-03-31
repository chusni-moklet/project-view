'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  projectId: string
  currentStatus?: string
}

const statusInfo: Record<string, { bg: string; text: string; label: string }> = {
  draft:       { bg: 'bg-gray-50 border-gray-200',   text: 'text-gray-700',   label: 'Project masih Draft — kamu bisa langsung verifikasi' },
  in_progress: { bg: 'bg-blue-50 border-blue-200',   text: 'text-blue-700',   label: 'Project sedang dikerjakan siswa' },
  submitted:   { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', label: 'Project menunggu verifikasi kamu' },
  rejected:    { bg: 'bg-red-50 border-red-200',     text: 'text-red-700',    label: 'Project sebelumnya ditolak — bisa diverifikasi ulang' },
}

export default function ProjectReviewActions({ projectId, currentStatus = 'submitted' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const info = statusInfo[currentStatus] || statusInfo.submitted

  async function approve() {
    setLoading('approve')
    const res = await fetch(`/api/student-projects/${projectId}/approve`, { method: 'POST' })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Gagal')
    }
    setLoading(null)
    router.refresh()
  }

  async function reject() {
    if (!note.trim()) { setError('Tulis catatan penolakan terlebih dahulu'); return }
    setLoading('reject')
    const res = await fetch(`/api/student-projects/${projectId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
    if (!res.ok) {
      const d = await res.json()
      setError(d.error || 'Gagal')
    }
    setLoading(null)
    setShowReject(false)
    router.refresh()
  }

  return (
    <Card className={`border ${info.bg}`}>
      <CardContent className="p-4 space-y-3">
        <p className={`text-sm font-medium ${info.text}`}>🔍 {info.label}</p>

        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

        {!showReject ? (
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={approve}
              disabled={!!loading}
              className="gap-2 bg-green-600 hover:bg-green-700 shadow-green-200"
              size="sm"
            >
              <CheckCircle className="h-4 w-4" />
              {loading === 'approve' ? 'Memproses...' : '✅ Verifikasi & Publish'}
            </Button>
            <Button
              onClick={() => { setShowReject(true); setError('') }}
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
            <p className="text-xs text-gray-600 font-medium">Tulis alasan penolakan untuk siswa:</p>
            <Textarea
              value={note}
              onChange={e => { setNote(e.target.value); setError('') }}
              placeholder="Contoh: Deskripsi project kurang lengkap, tambahkan fitur utama dan screenshot..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button onClick={reject} disabled={!!loading} variant="destructive" size="sm">
                {loading === 'reject' ? 'Menolak...' : 'Kirim Penolakan'}
              </Button>
              <Button onClick={() => { setShowReject(false); setError('') }} variant="ghost" size="sm">Batal</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
