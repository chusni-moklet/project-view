import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { Sparkles } from 'lucide-react'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">ProjectView</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/katalog" className="text-sm text-gray-600 hover:text-violet-600 font-medium transition-colors hidden sm:block">
            Katalog
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all">
                Dashboard
              </Link>
              <form action={logout}>
                <button type="submit" className="text-sm text-gray-500 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all">
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
