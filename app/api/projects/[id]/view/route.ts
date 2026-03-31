import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_views', { project_id: id })

  if (error) {
    // Fallback: manual increment
    const { data: current } = await supabase
      .from('student_projects')
      .select('views')
      .eq('id', id)
      .single()

    await supabase
      .from('student_projects')
      .update({ views: (current?.views || 0) + 1 })
      .eq('id', id)
  }

  return NextResponse.json({ success: true })
}
