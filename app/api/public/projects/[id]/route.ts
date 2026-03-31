import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('student_projects')
    .select(`*, student:users(name, email), project:projects(title, description), screenshots:project_screenshots(*)`)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}
