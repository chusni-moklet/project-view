import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('get_weekly_ranking')
    .limit(10)

  if (error) {
    // Fallback query if RPC not available
    const { data: fallback, error: fbError } = await supabase
      .from('student_projects')
      .select(`*, student:users(name), project:projects(title), screenshots:project_screenshots(url, is_primary)`)
      .eq('is_published', true)
      .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('likes_count', { ascending: false })
      .limit(10)

    if (fbError) return NextResponse.json({ error: fbError.message }, { status: 500 })
    const ranked = (fallback || []).map(p => ({
      ...p,
      ranking_score: (p.likes_count * 3) + p.views
    })).sort((a, b) => b.ranking_score - a.ranking_score)

    return NextResponse.json(ranked)
  }

  return NextResponse.json(data)
}
