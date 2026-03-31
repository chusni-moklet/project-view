'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'

interface Kelas {
  id: string; name: string; jurusan?: string; tahun_ajaran?: string
  mata_pelajaran?: { nama: string }
}
interface MapelItem { id: string; nama: string; kode?: string }

export default function KelasManager({
  classes, mataPelajaran
}: { classes: Kelas[]; mataPelajaran: MapelItem[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'kelas' | 'mapel'>('kelas')

  // Kelas form
  const [kelasForm, setKelasForm] = useState({ name: '', jurusan: 'RPL', tahun_ajaran: '2024/2025' })
  const [mapelForm, setMapelForm] = useState({ nama: '', kode: '' })
  const [loading, setLoading] = useState(false)

  async function addKelas() {
    if (!kelasForm.name) return
    setLoading(true)
    await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kelasForm),
    })
    setKelasForm({ name: '', jurusan: 'RPL', tahun_ajaran: '2024/2025' })
    setLoading(false)
    router.refresh()
  }

  async function deleteKelas(id: string) {
    if (!confirm('Hapus kelas ini?')) return
    await fetch('/api/classes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  async function addMapel() {
    if (!mapelForm.nama) return
    setLoading(true)
    await fetch('/api/mata-pelajaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapelForm),
    })
    setMapelForm({ nama: '', kode: '' })
    setLoading(false)
    router.refresh()
  }

  async function deleteMapel(id: string) {
    if (!confirm('Hapus mata pelajaran ini?')) return
    await fetch('/api/mata-pelajaran', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Kelola Kelas & Mata Pelajaran</h1>

      {/* Tab */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setTab('kelas')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'kelas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Kelas ({classes.length})
        </button>
        <button
          onClick={() => setTab('mapel')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'mapel' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Mata Pelajaran ({mataPelajaran.length})
        </button>
      </div>

      {tab === 'kelas' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tambah Kelas</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Nama Kelas</Label>
                  <Input
                    placeholder="XI RPL 1"
                    value={kelasForm.name}
                    onChange={e => setKelasForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Jurusan</Label>
                  <Input
                    placeholder="RPL"
                    value={kelasForm.jurusan}
                    onChange={e => setKelasForm(f => ({ ...f, jurusan: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tahun Ajaran</Label>
                  <Input
                    placeholder="2024/2025"
                    value={kelasForm.tahun_ajaran}
                    onChange={e => setKelasForm(f => ({ ...f, tahun_ajaran: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addKelas} disabled={loading} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Kelas
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {classes.length === 0 && <p className="text-gray-400 text-sm">Belum ada kelas</p>}
            {classes.map(k => (
              <Card key={k.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{k.name}</p>
                    <p className="text-sm text-gray-500">{k.jurusan} · {k.tahun_ajaran}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteKelas(k.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === 'mapel' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Tambah Mata Pelajaran</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nama Mata Pelajaran</Label>
                  <Input
                    placeholder="Pemrograman Web"
                    value={mapelForm.nama}
                    onChange={e => setMapelForm(f => ({ ...f, nama: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Kode (opsional)</Label>
                  <Input
                    placeholder="PWE"
                    value={mapelForm.kode}
                    onChange={e => setMapelForm(f => ({ ...f, kode: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addMapel} disabled={loading} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Tambah Mata Pelajaran
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {mataPelajaran.length === 0 && <p className="text-gray-400 text-sm">Belum ada mata pelajaran</p>}
            {mataPelajaran.map(m => (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.nama}</p>
                    {m.kode && <p className="text-sm text-gray-500">Kode: {m.kode}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMapel(m.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
