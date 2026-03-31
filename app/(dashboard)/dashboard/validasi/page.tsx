import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import ValidasiActions from '@/components/dashboard/ValidasiActions'

export default async function ValidasiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()

  if (!['guru', 'admin'].includes(profile?.role)) redirect('/dashboard')

  const { data: pending } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'siswa')
    .eq('is_verified', false)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Validasi Siswa</h1>
        <p className="text-gray-500">Siswa yang menunggu verifikasi akun</p>
      </div>

      {!pending || pending.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p>Tidak ada siswa yang menunggu verifikasi</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map(siswa => (
            <Card key={siswa.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{siswa.name}</p>
                  <p className="text-sm text-gray-500">{siswa.email}</p>
                  <p className="text-xs text-gray-400">Daftar: {new Date(siswa.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <ValidasiActions studentId={siswa.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
