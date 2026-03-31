'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from './ImageUpload'

interface Props {
  classes: { id: string; name: string; jurusan?: string; tahun_ajaran?: string }[]
  mataPelajaran: { id: string; nama: string; kode?: string }[]
  defaultClassId?: string
  defaultClassName?: string
}

export default function NewProjectForm({ classes, mataPelajaran, defaultClassId, defaultClassName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const body = Object.fromEntries(formData) as Record<string, string>

    if (thumbnailUrl) body.thumbnail_url = thumbnailUrl
    // Gunakan class_id dari profil siswa
    if (defaultClassId) body.class_id = defaultClassId

    const res = await fetch('/api/student-projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/dashboard/my-projects')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error || 'Gagal membuat project')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tambah Project Baru ✨</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Project</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Thumbnail */}
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-medium">Thumbnail / Screenshot Utama</Label>
              <ImageUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-gray-700 font-medium">Judul Project</Label>
              <Input id="title" name="title" placeholder="Nama project kamu" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-gray-700 font-medium">Deskripsi</Label>
              <Textarea id="description" name="description" placeholder="Jelaskan project kamu secara singkat..." rows={4} required />
            </div>

            {/* Info kelas (read-only dari profil) */}
            {defaultClassName && (
              <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-2">
                <span className="text-lg">📚</span>
                <div>
                  <p className="text-xs text-violet-500 font-medium">Kelas kamu</p>
                  <p className="text-sm font-semibold text-violet-700">{defaultClassName}</p>
                </div>
              </div>
            )}

            {/* Mata Pelajaran */}
            <div className="space-y-1.5">
              <Label htmlFor="mata_pelajaran_id" className="text-gray-700 font-medium">Mata Pelajaran</Label>
              <select
                id="mata_pelajaran_id" name="mata_pelajaran_id"
                className="flex h-11 w-full rounded-xl border-2 border-purple-100 bg-white px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                required
              >
                <option value="">Pilih mata pelajaran</option>
                {mataPelajaran.map(m => (
                  <option key={m.id} value={m.id}>{m.nama} {m.kode ? `(${m.kode})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="beneficiary_name" className="text-gray-700 font-medium">Penerima Manfaat</Label>
                <Input id="beneficiary_name" name="beneficiary_name" placeholder="Nama penerima" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="beneficiary_type" className="text-gray-700 font-medium">Jenis Penerima</Label>
                <Input id="beneficiary_type" name="beneficiary_type" placeholder="UMKM, Sekolah, dll" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location_name" className="text-gray-700 font-medium">Lokasi</Label>
              <Input id="location_name" name="location_name" placeholder="Kota / Daerah" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="demo_url" className="text-gray-700 font-medium">Demo URL</Label>
                <Input id="demo_url" name="demo_url" type="url" placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="github_url" className="text-gray-700 font-medium">GitHub URL</Label>
                <Input id="github_url" name="github_url" type="url" placeholder="https://github.com/..." />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Project 🚀'}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
