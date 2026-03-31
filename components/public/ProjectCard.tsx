import Link from 'next/link'
import { Eye, Heart, MapPin, Users } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { StudentProject } from '@/types'

interface Props {
  project: StudentProject & { rank?: number }
}

const rankColors = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-500']
const rankEmoji = ['🥇', '🥈', '🥉']

export default function ProjectCard({ project }: Props) {
  const screenshot = project.screenshots?.find(s => s.is_primary) || project.screenshots?.[0]
  const isTop3 = project.rank && project.rank <= 3

  return (
    <Link href={`/katalog/${project.id}`}>
      <div className="bg-white rounded-3xl overflow-hidden border border-purple-100 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
        {/* Image */}
        <div className="relative h-44 bg-gradient-to-br from-violet-100 to-purple-200 overflow-hidden">
          {isTop3 && (
            <div className="absolute top-3 left-3 z-10 text-xl">{rankEmoji[(project.rank || 1) - 1]}</div>
          )}
          {screenshot ? (
            <img src={screenshot.url} alt={project.project?.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl opacity-40">💻</span>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">{project.project?.title}</h3>
          {project.beneficiary_name && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="h-3 w-3 text-violet-400" />
              <span className="line-clamp-1">{project.beneficiary_name}</span>
            </div>
          )}
          {project.location_name && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3 text-pink-400" />
              <span>{project.location_name}</span>
            </div>
          )}
          <div className="flex items-center gap-3 pt-1 border-t border-purple-50">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="h-3 w-3" /> {formatNumber(project.views)}
            </span>
            <span className="flex items-center gap-1 text-xs text-pink-500 font-medium">
              <Heart className="h-3 w-3 fill-pink-400" /> {formatNumber(project.likes_count)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
