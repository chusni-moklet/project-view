'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function AddProgressForm({ studentProjectId }: { studentProjectId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_project_id: studentProjectId,
        title: formData.get('title'),
        description: formData.get('description'),
        progress_percent: Number(formData.get('progress_percent')),
      }),
    })
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
        + Tambah Update Progress
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Update Progress</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label>Judul Update</Label>
            <Input name="title" placeholder="Apa yang sudah dikerjakan?" required />
          </div>
          <div className="space-y-1">
            <Label>Deskripsi</Label>
            <Textarea name="description" placeholder="Detail pekerjaan..." rows={3} required />
          </div>
          <div className="space-y-1">
            <Label>Progress (%)</Label>
            <Input name="progress_percent" type="number" min={0} max={100} placeholder="0-100" required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
