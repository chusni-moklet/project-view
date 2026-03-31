import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const error = params?.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 px-4">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-violet-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-purple-300/30 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-purple-100 border border-purple-100 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">ProjectView</h1>
            <p className="text-gray-500 text-sm mt-1">Platform Project Siswa RPL</p>
          </div>

          <form action={login} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input id="email" name="email" type="email" placeholder="nama@smktelkom-mlg.sch.id" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" required />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{decodeURIComponent(error)}</p>
              </div>
            )}
            <Button type="submit" className="w-full h-12 text-base mt-2">Masuk 🚀</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-violet-600 font-semibold hover:underline">Daftar</Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2">
            <Link href="/" className="hover:text-violet-500 transition-colors">← Lihat Katalog</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
