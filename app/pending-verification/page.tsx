import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 px-4">
      <div className="absolute top-20 left-10 w-40 h-40 bg-violet-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-purple-300/30 rounded-full blur-3xl" />

      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100 border border-purple-100 p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Menunggu Verifikasi</h1>
        <p className="text-gray-500 text-sm mb-2">
          Akun kamu sedang menunggu verifikasi dari guru.
        </p>
        <p className="text-gray-400 text-xs mb-6">
          Hubungi guru kamu untuk melakukan verifikasi akun.
        </p>
        <div className="bg-violet-50 rounded-2xl p-4 mb-6">
          <p className="text-xs text-violet-600 font-medium">💡 Setelah diverifikasi, kamu bisa login dan mulai upload project!</p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit" className="w-full">Keluar</Button>
        </form>
      </div>
    </div>
  )
}
