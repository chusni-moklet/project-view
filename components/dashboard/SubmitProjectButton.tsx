'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export default function SubmitProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!confirm('Yakin ingin mengajukan project ini untuk direview guru?')) return
    setLoading(true)
    const res = await fetch(`/api/student-projects/${projectId}/submit`, { method: 'POST' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Gagal mengajukan project')
    }
    setLoading(false)
  }

  return (
    <Button onClick={handleSubmit} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
      <Send className="h-4 w-4" />
      {loading ? 'Mengajukan...' : 'Ajukan ke Guru'}
    </Button>
  )
}
