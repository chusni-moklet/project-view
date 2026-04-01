import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Eye, Heart, MapPin, Users, GitBranch, Globe, GraduationCap, BookOpen } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import LikeButton from '@/components/public/LikeButton'
import ViewTracker from '@/components/public/ViewTracker'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('student_projects')
    .select(`
      *, 
      student:users(name, email), 
      project:projects(title, description), 
      screenshots:project_screenshots(*),
      mata_pelajaran(*),
      class:classes(name, tahun_ajaran)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!project) notFound()

  // Kalau nama siswa tidak terbaca karena RLS, ambil via public info dari student_projects
  const studentName = project.student?.name || 'Siswa RPL'

  const { data: { user } } = await supabase.auth.getUser()
  let userLiked = false
  if (user) {
    const { data: like } = await supabase
      .from('project_likes').select('id')
      .eq('project_id', id).eq('user_id', user.id).single()
    userLiked = !!like
  }

  const primaryScreenshot = project.screenshots?.find((s: { is_primary: boolean }) => s.is_primary) || project.screenshots?.[0]

  // Generate gradient default thumbnail berdasarkan judul
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-pink-500 to-rose-500',
    'from-amber-400 to-orange-500',
    'from-green-500 to-emerald-600',
    'from-indigo-500 to-blue-600',
  ]
  const gradientIndex = project.project?.title?.charCodeAt(0) % gradients.length || 0
  const gradient = gradients[gradientIndex]
  const titleInitial = project.project?.title?.charAt(0).toUpperCase() || '?'

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <ViewTracker projectId={id} />

      {/* Thumbnail */}
      <div className="rounded-3xl overflow-hidden mb-6 h-64 md:h-80 shadow-lg">
        {primaryScreenshot ? (
          <img src={primaryScreenshot.url} alt={project.project?.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-3`}>
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{titleInitial}</span>
            </div>
            <p className="text-white/70 text-sm">Belum ada thumbnail</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Kiri: info utama */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{project.project?.title}</h1>
            <p className="text-gray-500 leading-relaxed mt-3 text-sm md:text-base">{project.project?.description}</p>

            {/* Tombol Demo & GitHub langsung di bawah deskripsi */}
            {(project.demo_url || project.github_url) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all">
                    <Globe className="h-4 w-4" /> Demo Project
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                    <GitBranch className="h-4 w-4" /> GitHub
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Screenshots gallery */}
          {project.screenshots?.length > 1 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">📸 Screenshot</h3>
              <div className="grid grid-cols-3 gap-2">
                {project.screenshots.map((s: { id: string; url: string }) => (
                  <img key={s.id} src={s.url} alt="" className="rounded-2xl h-24 w-full object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kanan: info card */}
        <div className="space-y-3">
          {/* Info */}
          <div className="bg-white rounded-2xl border border-purple-100 p-4 space-y-3">
            {/* Siswa */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-4 w-4 text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Siswa</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{studentName}</p>
              </div>
            </div>

            {/* Kelas */}
            {project.class && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Kelas</p>
                  <p className="text-sm font-semibold text-gray-900">{project.class.name}</p>
                </div>
              </div>
            )}

            {/* Penerima */}
            {project.beneficiary_name && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Penerima Manfaat</p>
                  <p className="text-sm font-semibold text-gray-900">{project.beneficiary_name}</p>
                </div>
              </div>
            )}

            {/* Lokasi */}
            {project.location_name && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Lokasi</p>
                  <p className="text-sm font-semibold text-gray-900">{project.location_name}</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 pt-2 border-t border-purple-50">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                <Eye className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-600">{formatNumber(project.views)}</span>
                <span className="text-xs text-gray-400">dilihat</span>
              </div>
              <div className="flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-xl">
                <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-400" />
                <span className="text-xs font-medium text-pink-600">{formatNumber(project.likes_count)}</span>
                <span className="text-xs text-pink-400">suka</span>
              </div>
            </div>
          </div>

          {/* Like */}
          <LikeButton projectId={id} initialLiked={userLiked} initialCount={project.likes_count} />
        </div>
      </div>
    </main>
  )
}
