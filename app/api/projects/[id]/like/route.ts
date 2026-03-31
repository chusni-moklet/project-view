import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

  // Check if already liked
  let existingQuery = supabase.from('project_likes').select('id').eq('project_id', id)
  if (user) {
    existingQuery = existingQuery.eq('user_id', user.id)
  } else {
    existingQuery = existingQuery.eq('ip_address', ip)
  }

  const { data: existing } = await existingQuery.single()
  if (existing) return NextResponse.json({ error: 'Sudah di-like' }, { status: 400 })

  await supabase.from('project_likes').insert({
    project_id: id,
    user_id: user?.id || null,
    ip_address: ip,
  })

  // Increment likes_count
  const { data: current } = await supabase
    .from('student_projects').select('likes_count').eq('id', id).single()
  await supabase
    .from('student_projects')
    .update({ likes_count: (current?.likes_count || 0) + 1 })
    .eq('id', id)

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('project_likes').delete().eq('project_id', id).eq('user_id', user.id)

  const { data: current } = await supabase
    .from('student_projects').select('likes_count').eq('id', id).single()
  await supabase
    .from('student_projects')
    .update({ likes_count: Math.max((current?.likes_count || 1) - 1, 0) })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
