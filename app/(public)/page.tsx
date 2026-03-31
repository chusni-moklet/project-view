import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/public/ProjectCard'

async function getWeeklyRanking() {
  const supabase = await createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Coba ambil project minggu ini dulu
  const { data: weekly } = await supabase
    .from('student_projects')
    .select(`*, student:users(name), project:projects(title, description), screenshots:project_screenshots(url, is_primary)`)
    .eq('is_published', true)
    .gte('published_at', sevenDaysAgo)
    .order('likes_count', { ascending: false })
    .limit(8)

  // Kalau kosong, ambil semua project published
  const { data: all } = weekly && weekly.length > 0 ? { data: weekly } : await supabase
    .from('student_projects')
    .select(`*, student:users(name), project:projects(title, description), screenshots:project_screenshots(url, is_primary)`)
    .eq('is_published', true)
    .order('likes_count', { ascending: false })
    .limit(8)

  return (all || [])
    .map(p => ({ ...p, ranking_score: (p.likes_count * 3) + p.views }))
    .sort((a, b) => b.ranking_score - a.ranking_score)
    .map((p, i) => ({ ...p, rank: i + 1 }))
}

export default async function HomePage() {
  const ranking = await getWeeklyRanking()

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white py-16 px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            <span>🎓</span> Platform Project Siswa RPL SMK Telkom Malang
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Showcase Project<br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Terbaik Siswa</span>
          </h1>
          <p className="text-purple-200 text-base sm:text-lg max-w-xl mx-auto">
            Temukan project inovatif, berikan dukungan, dan jadilah bagian dari komunitas developer muda!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/katalog" className="bg-white text-violet-700 font-bold px-6 py-3 rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm">
              🔍 Jelajahi Katalog
            </Link>
            <Link href="/register" className="bg-white/20 backdrop-blur-sm text-white font-bold px-6 py-3 rounded-2xl hover:bg-white/30 transition-all text-sm border border-white/30">
              ✨ Daftar Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Weekly Ranking */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-gray-900">Top Project Minggu Ini</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Ranking berdasarkan likes & views 7 hari terakhir</p>
          </div>
          <Link href="/katalog" className="text-sm text-violet-600 font-semibold hover:underline hidden sm:block">
            Lihat semua →
          </Link>
        </div>

        {ranking.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-purple-100">
            <div className="text-5xl mb-4">🚀</div>
            <p className="text-gray-500 font-medium">Belum ada project minggu ini</p>
            <p className="text-gray-400 text-sm mt-1">Jadilah yang pertama publish project!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {ranking.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        <div className="text-center mt-6 sm:hidden">
          <Link href="/katalog" className="text-sm text-violet-600 font-semibold">Lihat semua project →</Link>
        </div>
      </section>

      {/* Stats banner */}
      <section className="bg-gradient-to-r from-violet-500 to-purple-600 mx-4 mb-10 rounded-3xl p-6 text-white text-center">
        <p className="text-purple-200 text-sm mb-2">Bergabung dengan komunitas kami</p>
        <h3 className="text-xl font-bold">Siap showcase project kamu? 🎯</h3>
        <Link href="/register" className="inline-block mt-4 bg-white text-violet-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:shadow-lg transition-all">
          Mulai Sekarang
        </Link>
      </section>
    </main>
  )
}
