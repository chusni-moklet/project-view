import { createClient } from '@/lib/supabase/server'
import ProjectCard from '@/components/public/ProjectCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SearchParams {
  lokasi?: string
  kelas?: string
}

export default async function KatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('student_projects')
    .select(`*, student:users(name, class_id), project:projects(title, description), screenshots:project_screenshots(url, is_primary)`)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (params.lokasi) query = query.ilike('location_name', `%${params.lokasi}%`)

  const { data: projects } = await query

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Katalog Project</h1>
        <p className="text-gray-500">Semua project siswa RPL SMK Telkom Malang</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-xl border">
        <form className="flex flex-wrap gap-3 w-full">
          <input
            name="lokasi"
            defaultValue={params.lokasi}
            placeholder="Filter lokasi..."
            className="h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="h-10 px-4 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
            Filter
          </button>
          {params.lokasi && (
            <a href="/katalog" className="h-10 px-4 flex items-center border rounded-md text-sm text-gray-600 hover:bg-gray-50">
              Reset
            </a>
          )}
        </form>
      </div>

      {/* Grid */}
      {!projects || projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Belum ada project yang dipublikasikan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </main>
  )
}
