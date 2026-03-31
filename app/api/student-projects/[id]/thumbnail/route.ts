import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()

  // Hapus screenshot primary lama
  await supabase
    .from('project_screenshots')
    .delete()
    .eq('student_project_id', id)
    .eq('is_primary', true)

  // Insert yang baru
  const { data, error } = await supabase
    .from('project_screenshots')
    .insert({ student_project_id: id, url, is_primary: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
