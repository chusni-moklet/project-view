'use client'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'

interface Props {
  projectId: string
  initialLiked: boolean
  initialCount: number
}

export default function LikeButton({ projectId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function handleLike() {
    if (loading) return
    setLoading(true)
    try {
      if (liked) {
        await fetch(`/api/projects/${projectId}/like`, { method: 'DELETE' })
        setLiked(false)
        setCount(c => c - 1)
      } else {
        const res = await fetch(`/api/projects/${projectId}/like`, { method: 'POST' })
        if (res.ok) {
          setLiked(true)
          setCount(c => c + 1)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLike}
      disabled={loading}
      variant={liked ? 'default' : 'outline'}
      className={`w-full gap-2 ${liked ? 'bg-pink-500 hover:bg-pink-600 border-pink-500' : 'border-pink-200 text-pink-500 hover:bg-pink-50'}`}
    >
      <Heart className={`h-4 w-4 ${liked ? 'fill-white' : ''}`} />
      {liked ? '❤️ Disukai' : '🤍 Suka'} · {formatNumber(count)}
    </Button>
  )
}
