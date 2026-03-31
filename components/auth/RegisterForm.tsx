'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Kelas {
  id: string
  name: string
  tahun_ajaran?: string
  jurusan?: string
}

interface Props {
  classes: Kelas[]
  error?: string
}

// Group kelas by tahun_ajaran
function groupByTahunAjaran(classes: Kelas[]) {
  return classes.reduce((acc, k) => {
    const key = k.tahun_ajaran || 'Lainnya'
    if (!acc[key]) acc[key] = []
    acc[key].push(k)
    return acc
  }, {} as Record<string, Kelas[]>)
}

export default function RegisterForm({ classes, error: initialError }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError || '')
  const grouped = groupByTahunAjaran(classes)
  const tahunList = Object.keys(grouped).sort().reverse()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const password = formData.get('password') as string
    const class_id = formData.get('class_id') as string

    if (!email.endsWith('@student.smktelkom-mlg.sch.id')) {
      setError('Email harus menggunakan domain @student.smktelkom-mlg.sch.id')
      setLoading(false)
      return
    }

    if (!class_id) {
      setError('Pilih kelas terlebih dahulu')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, class_id }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Gagal mendaftar')
      setLoading(false)
      return
    }

    router.push('/pending-verification')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 px-4 py-8">
      <div className="absolute top-20 right-10 w-40 h-40 bg-violet-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-purple-300/30 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100 border border-purple-100 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
              <span className="text-2xl">🎓</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Daftar Akun</h1>
            <p className="text-gray-500 text-sm mt-1">Gunakan email siswa sekolah</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-700 font-medium text-sm">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="Nama kamu" required />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email Siswa</Label>
              <Input id="email" name="email" type="email" placeholder="nama@student.smktelkom-mlg.sch.id" required />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Min. 6 karakter" minLength={6} required />
            </div>

            {/* Kelas */}
            <div className="space-y-1.5">
              <Label htmlFor="class_id" className="text-gray-700 font-medium text-sm">Kelas</Label>
              {classes.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-600">⚠️ Belum ada kelas. Hubungi admin.</p>
                </div>
              ) : (
                <select
                  id="class_id"
                  name="class_id"
                  required
                  className="flex h-11 w-full rounded-xl border-2 border-purple-100 bg-white px-3 py-2 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                >
                  <option value="">Pilih kelas kamu</option>
                  {tahunList.map(tahun => (
                    <optgroup key={tahun} label={`Tahun Ajaran ${tahun}`}>
                      {grouped[tahun].map(k => (
                        <option key={k.id} value={k.id}>
                          {k.name} {k.jurusan ? `- ${k.jurusan}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>

            {/* Info domain */}
            <div className="bg-violet-50 rounded-xl p-3">
              <p className="text-xs text-violet-600">
                📧 Hanya email <strong>@student.smktelkom-mlg.sch.id</strong> yang bisa daftar
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>
              </div>
            )}

            <Button type="submit" disabled={loading || classes.length === 0} className="w-full h-12 text-base">
              {loading ? 'Mendaftar...' : 'Daftar Sekarang ✨'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-violet-600 font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
