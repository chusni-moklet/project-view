'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ValidasiActions from './ValidasiActions'
import { Trash2, Search } from 'lucide-react'

interface User {
  id: string; name: string; email: string; role: string
  is_verified: boolean; created_at: string; class_id?: string
  class?: { id: string; name: string; tahun_ajaran?: string }
}
interface Kelas { id: string; name: string; tahun_ajaran?: string }

export default function UsersClient({
  users, classes, currentUserId
}: { users: User[]; classes: Kelas[]; currentUserId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterTahun, setFilterTahun] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const tahunList = [...new Set(classes.map(c => c.tahun_ajaran).filter(Boolean))] as string[]

  const filtered = useMemo(() => {
    return users.filter(u => {
      // Filter search
      if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false
      // Filter role
      if (filterRole && u.role !== filterRole) return false
      // Filter kelas & tahun hanya relevan untuk siswa
      if (filterKelas && u.class_id !== filterKelas) return false
      if (filterTahun && u.class?.tahun_ajaran !== filterTahun) return false
      return true
    })
  }, [users, search, filterKelas, filterTahun, filterRole])

  const pending = filtered.filter(u => u.role === 'siswa' && !u.is_verified)
  const rest = filtered.filter(u => u.role !== 'siswa' || u.is_verified)

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Hapus user "${name}"? Semua data terkait akan ikut terhapus.`)) return
    setDeleting(id)
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const d = await res.json()
      alert(d.error || 'Gagal menghapus')
    }
    setDeleting(null)
    router.refresh()
  }

  const selectClass = "h-9 rounded-xl border-2 border-purple-100 bg-white px-3 text-sm focus:outline-none focus:border-violet-400 transition-all"

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-purple-100 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border-2 border-purple-100 text-sm focus:outline-none focus:border-violet-400 transition-all"
          />
        </div>
        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className={selectClass}>
            <option value="">Semua Role</option>
            <option value="siswa">🎓 Siswa</option>
            <option value="guru">👨‍🏫 Guru</option>
            <option value="admin">⚡ Admin</option>
          </select>
          <select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setFilterKelas('') }} className={selectClass}>
            <option value="">Semua Tahun</option>
            {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)} className={selectClass}>
            <option value="">Semua Kelas</option>
            {classes
              .filter(c => !filterTahun || c.tahun_ajaran === filterTahun)
              .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {(search || filterKelas || filterTahun || filterRole) && (
            <button
              onClick={() => { setSearch(''); setFilterKelas(''); setFilterTahun(''); setFilterRole('') }}
              className="h-9 px-3 rounded-xl text-xs text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400">{filtered.length} user ditemukan</p>
      </div>

      {/* Pending section */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <h2 className="font-semibold text-gray-800">Menunggu Verifikasi</h2>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          {pending.map(u => (
            <Card key={u.id} className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{u.name}</p>
                    <Badge variant="warning">Pending</Badge>
                    {u.class && <Badge variant="secondary">{u.class.name}</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ValidasiActions studentId={u.id} />
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => deleteUser(u.id, u.name)}
                    disabled={deleting === u.id}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All users */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h2 className="font-semibold text-gray-800">Semua User</h2>
          <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">{rest.length}</span>
        </div>
        {rest.length === 0 && (
          <Card><CardContent className="py-10 text-center text-gray-400">Tidak ada user ditemukan</CardContent></Card>
        )}
        {rest.map(u => (
          <Card key={u.id}>
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  {u.class && <p className="text-xs text-violet-500">{u.class.name} · {u.class.tahun_ajaran}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={u.role === 'admin' ? 'default' : u.role === 'guru' ? 'warning' : 'secondary'}>
                  {u.role === 'admin' ? '⚡' : u.role === 'guru' ? '👨‍🏫' : '🎓'} {u.role}
                </Badge>
                {u.role === 'siswa' && (
                  <Badge variant="success">Verified</Badge>
                )}
                {u.id !== currentUserId && (
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => deleteUser(u.id, u.name)}
                    disabled={deleting === u.id}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                  >
                    {deleting === u.id ? (
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
