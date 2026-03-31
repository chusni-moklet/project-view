import { createClient } from '@/lib/supabase/server'
import { FolderOpen, Eye, Heart, Users, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('*').eq('id', user!.id).single()

  let stats = { projects: 0, views: 0, likes: 0, pending: 0, submitted: 0 }

  if (profile?.role === 'siswa') {
    const { data: projects } = await supabase
      .from('student_projects').select('views, likes_count, status').eq('student_id', user!.id)
    stats.projects = projects?.length || 0
    stats.views = projects?.reduce((a, p) => a + p.views, 0) || 0
    stats.likes = projects?.reduce((a, p) => a + p.likes_count, 0) || 0
  } else {
    const { count: pc } = await supabase.from('student_projects').select('*', { count: 'exact', head: true })
    const { count: pend } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'siswa').eq('is_verified', false)
    const { count: sub } = await supabase.from('student_projects').select('*', { count: 'exact', head: true }).eq('status', 'submitted')
    stats.projects = pc || 0
    stats.pending = pend || 0
    stats.submitted = sub || 0
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'

  const siswaCards = [
    { label: 'Total Project', value: stats.projects, icon: '📁', from: 'from-violet-500', to: 'to-purple-600', link: '/dashboard/my-projects' },
    { label: 'Total Views', value: stats.views, icon: '👁️', from: 'from-blue-500', to: 'to-cyan-500', link: null },
    { label: 'Total Likes', value: stats.likes, icon: '❤️', from: 'from-pink-500', to: 'to-rose-500', link: null },
  ]

  const adminCards = [
    { label: 'Total Project', value: stats.projects, icon: '📁', from: 'from-violet-500', to: 'to-purple-600', link: '/dashboard/monitoring' },
    { label: 'Siswa Pending', value: stats.pending, icon: '⏳', from: 'from-amber-400', to: 'to-orange-500', link: '/dashboard/users' },
    { label: 'Perlu Review', value: stats.submitted, icon: '📋', from: 'from-blue-500', to: 'to-indigo-600', link: '/dashboard/monitoring' },
  ]

  const cards = profile?.role === 'siswa' ? siswaCards : adminCards

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-20 w-20 h-20 bg-white/10 rounded-full translate-y-6" />
        <div className="relative">
          <p className="text-purple-200 text-sm font-medium">{greeting} 👋</p>
          <h1 className="text-2xl font-bold mt-1">{profile?.name}</h1>
          <span className="inline-block mt-2 bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full capitalize">
            {profile?.role === 'admin' ? '⚡ Admin' : profile?.role === 'guru' ? '👨‍🏫 Guru' : '🎓 Siswa'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.from} ${card.to} rounded-3xl p-5 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
            <div className="text-3xl mb-2">{card.icon}</div>
            <p className="text-white/80 text-xs font-medium">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
            {card.link && (
              <Link href={card.link} className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition-colors">
                Lihat →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Aksi Cepat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile?.role === 'siswa' && (
            <>
              <Link href="/dashboard/my-projects/new" className="bg-white rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all border border-purple-100">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-xs font-medium text-gray-700">Buat Project</p>
              </Link>
              <Link href="/dashboard/my-projects" className="bg-white rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all border border-purple-100">
                <div className="text-2xl mb-2">📁</div>
                <p className="text-xs font-medium text-gray-700">My Projects</p>
              </Link>
              <Link href="/katalog" className="bg-white rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all border border-purple-100">
                <div className="text-2xl mb-2">🌐</div>
                <p className="text-xs font-medium text-gray-700">Katalog</p>
              </Link>
            </>
          )}
          {['guru', 'admin'].includes(profile?.role) && (
            <>
              <Link href="/dashboard/users" className="bg-white rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all border border-purple-100">
                <div className="text-2xl mb-2">✅</div>
                <p className="text-xs font-medium text-gray-700">Validasi</p>
              </Link>
              <Link href="/dashboard/monitoring" className="bg-white rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all border border-purple-100">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-xs font-medium text-gray-700">Monitoring</p>
              </Link>
              <Link href="/katalog" className="bg-white rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all border border-purple-100">
                <div className="text-2xl mb-2">🌐</div>
                <p className="text-xs font-medium text-gray-700">Katalog</p>
              </Link>
              {profile?.role === 'admin' && (
                <Link href="/dashboard/kelas" className="bg-white rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all border border-purple-100">
                  <div className="text-2xl mb-2">📚</div>
                  <p className="text-xs font-medium text-gray-700">Kelas</p>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
