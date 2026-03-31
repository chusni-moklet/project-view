'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/app/actions/auth'
import { User } from '@/types'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FolderOpen, Users, BookOpen,
  LogOut, CheckSquare, Menu, X, Sparkles
} from 'lucide-react'

const navItems = {
  siswa: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
    { href: '/dashboard/my-projects', label: 'Project Saya', icon: FolderOpen, emoji: '📁' },
  ],
  guru: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
    { href: '/dashboard/monitoring', label: 'Monitoring', icon: BookOpen, emoji: '📊' },
    { href: '/dashboard/validasi', label: 'Validasi Siswa', icon: CheckSquare, emoji: '✅' },
  ],
  admin: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '🏠' },
    { href: '/dashboard/users', label: 'Kelola User', icon: Users, emoji: '👥' },
    { href: '/dashboard/kelas', label: 'Kelas & Mapel', icon: BookOpen, emoji: '📚' },
    { href: '/dashboard/monitoring', label: 'Monitoring', icon: FolderOpen, emoji: '📊' },
  ],
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  guru: 'bg-blue-100 text-blue-700',
  siswa: 'bg-green-100 text-green-700',
}

const roleEmoji: Record<string, string> = {
  admin: '⚡', guru: '👨‍🏫', siswa: '🎓'
}

export default function DashboardSidebar({ profile }: { profile: User }) {
  const pathname = usePathname()
  const items = navItems[profile.role] || []
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-purple-100">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            ProjectView
          </span>
        </Link>

        {/* Profile */}
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{profile.name}</p>
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', roleColors[profile.role])}>
              {roleEmoji[profile.role]} {profile.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-200'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
              )}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-purple-100">
        <form action={logout}>
          <button type="submit" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 w-full transition-all">
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">ProjectView</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-purple-50">
          {mobileOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'lg:hidden fixed top-14 left-0 bottom-0 z-40 w-72 bg-white shadow-2xl transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-purple-100 min-h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  )
}
