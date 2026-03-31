import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const kelas = searchParams.get('kelas')
  const teknologi = searchParams.get('teknologi')
  const lokasi = searchParams.get('lokasi')

  let query = supabase
    .from('student_projects')
    .select(`*, student:users(name, email), project:projects(title, description)`)
    .eq('is_published', true)
    .order('likes_count', { ascending: false })

  if (lokasi) query = query.ilike('location_name', `%${lokasi}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
