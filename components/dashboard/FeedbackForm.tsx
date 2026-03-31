'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function FeedbackForm({ progressId }: { progressId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('approved')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress_id: progressId, comment, status }),
    })
    setLoading(false)
    setOpen(false)
    setComment('')
    router.refresh()
  }

  if (!open) return (
    <Button size="sm" variant="outline" onClick={() => setOpen(true)}>+ Beri Feedback</Button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border-t pt-3">
      <Textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Tulis feedback..."
        rows={2}
        required
      />
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="h-8 px-2 rounded border border-gray-300 text-sm"
        >
          <option value="approved">Approved</option>
          <option value="revision">Perlu Revisi</option>
          <option value="pending">Pending</option>
        </select>
        <Button size="sm" type="submit" disabled={loading}>{loading ? '...' : 'Kirim'}</Button>
        <Button size="sm" type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
      </div>
    </form>
  )
}
