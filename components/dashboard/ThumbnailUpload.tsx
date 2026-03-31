'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from './ImageUpload'

interface Props {
  projectId: string
  currentUrl?: string
}

export default function ThumbnailUpload({ projectId, currentUrl }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleChange(url: string) {
    if (!url) return
    setSaving(true)
    await fetch(`/api/student-projects/${projectId}/thumbnail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          🖼️ Thumbnail Project
          {saving && <span className="text-xs text-violet-500 font-normal">Menyimpan...</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ImageUpload
          value={currentUrl}
          onChange={handleChange}
          projectId={projectId}
        />
        <p className="text-xs text-gray-400 mt-2">Thumbnail akan tampil di katalog publik</p>
      </CardContent>
    </Card>
  )
}
