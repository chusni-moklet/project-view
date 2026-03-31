'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

export default function ValidasiActions({ studentId }: { studentId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function handle(action: 'approve' | 'reject') {
    setLoading(action)
    await fetch(`/api/students/${studentId}/${action}`, { method: 'POST' })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handle('approve')}
        disabled={!!loading}
        className="gap-1 bg-green-600 hover:bg-green-700"
      >
        <Check className="h-3 w-3" />
        {loading === 'approve' ? '...' : 'Approve'}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handle('reject')}
        disabled={!!loading}
        className="gap-1"
      >
        <X className="h-3 w-3" />
        {loading === 'reject' ? '...' : 'Tolak'}
      </Button>
    </div>
  )
}
