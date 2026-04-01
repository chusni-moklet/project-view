'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, EyeOff } from 'lucide-react'

interface Props {
  projectId: string
  isPublished: boolean
  projectTitle: string
}

export default function ProjectActions({ projectId, isPublished, projectTitle }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'unpublish' | 'delete' | null>(null)

  async function unpublish() {
    if (!confirm(`Unpublish project "${projectTitle}"? Project tidak akan tampil di katalog.`)) return
    setLoading('unpublish')
    await fetch(`/api/student-projects/${projectId}/unpublish`, { method: 'POST' })
    setLoading(null)
    router.refresh()
  }

  async function deleteProject() {
    if (!confirm(`Hapus project "${projectTitle}"? Semua data akan terhapus permanen.`)) return
    setLoading('delete')
    const res = await fetch(`/api/student-projects/${projectId}/delete`, { method: 'DELETE' })
    if (!res.ok) {
      const d = await res.json()
      alert(d.error || 'Gagal menghapus')
      setLoading(null)
      return
    }
    setLoading(null)
    router.push('/dashboard/monitoring')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1">
      {isPublished && (
        <Button
          variant="ghost" size="sm"
          onClick={unpublish}
          disabled={!!loading}
          className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 gap-1 text-xs h-8"
        >
          <EyeOff className="h-3.5 w-3.5" />
          {loading === 'unpublish' ? '...' : 'Unpublish'}
        </Button>
      )}
      <Button
        variant="ghost" size="icon"
        onClick={deleteProject}
        disabled={!!loading}
        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
      >
        {loading === 'delete'
          ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
          : <Trash2 className="h-4 w-4" />
        }
      </Button>
    </div>
  )
}
