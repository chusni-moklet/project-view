'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Globe, EyeOff } from 'lucide-react'

export default function PublishToggle({ projectId, isPublished }: { projectId: string; isPublished: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(isPublished)

  async function toggle() {
    setLoading(true)
    const newState = !published
    await fetch(`/api/student-projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_published: newState,
        published_at: newState ? new Date().toISOString() : null,
      }),
    })
    setPublished(newState)
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant={published ? 'outline' : 'default'}
      className="gap-2"
    >
      {published ? <><EyeOff className="h-4 w-4" /> Unpublish</> : <><Globe className="h-4 w-4" /> Publish</>}
    </Button>
  )
}
