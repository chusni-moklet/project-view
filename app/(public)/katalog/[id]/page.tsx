import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Eye, Heart, MapPin, Users, Github, Globe, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatNumber } from '@/lib/utils'
import LikeButton from '@/components/public/LikeButton'
import ViewTracker from '@/components/public/ViewTracker'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('student_projects')
    .select(`*, student:users(name, email), project:projects(title, description), screenshots:project_screenshots(*)`)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!project) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // Check if user liked
  let userLiked = false
  if (user) {
    const { data: like } = await supabase
      .from('project_likes')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single()
    userLiked = !!like
  }

  const primaryScreenshot = project.screenshots?.find((s: { is_primary: boolean }) => s.is_primary) || project.screenshots?.[0]

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <ViewTracker projectId={id} />

      {/* Screenshot */}
      <div className="rounded-2xl overflow-hidden bg-gray-100 mb-8 h-72 md:h-96">
        {primaryScreenshot ? (
          <img src={primaryScreenshot.url} alt={project.project?.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.project?.title}</h1>
            <p className="text-gray-600 leading-relaxed">{project.project?.description}</p>
          </div>

          {/* Screenshots gallery */}
          {project.screenshots?.length > 1 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Screenshot</h3>
              <div className="grid grid-cols-3 gap-2">
                {project.screenshots.map((s: { id: string; url: string }) => (
                  <img key={s.id} src={s.url} alt="" className="rounded-lg h-24 w-full object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">Siswa:</span>
              <span className="font-medium">{project.student?.name}</span>
            </div>
            {project.beneficiary_name && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-500" />
                <span className="text-gray-600">Penerima:</span>
                <span className="font-medium">{project.beneficiary_name}</span>
              </div>
            )}
            {project.location_name && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="text-gray-600">Lokasi:</span>
                <span className="font-medium">{project.location_name}</span>
              </div>
            )}
            <div className="flex items-center gap-4 pt-2 border-t">
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="h-4 w-4" /> {formatNumber(project.views)}
              </span>
              <span className="flex items-center gap-1 text-sm text-red-500">
                <Heart className="h-4 w-4" /> {formatNumber(project.likes_count)}
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            {project.demo_url && (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <Globe className="h-4 w-4" /> Demo Project
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
          </div>

          {/* Like button */}
          <LikeButton projectId={id} initialLiked={userLiked} initialCount={project.likes_count} />
        </div>
      </div>
    </main>
  )
}
