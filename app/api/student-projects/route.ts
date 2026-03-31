import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Create project first
  const { data: project, error: pErr } = await supabase
    .from('projects')
    .insert({ title: body.title, description: body.description, created_by: user.id })
    .select()
    .single()

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })

  // Create student_project
  const { data, error } = await supabase
    .from('student_projects')
    .insert({
      student_id: user.id,
      project_id: project.id,
      status: 'draft',
      beneficiary_name: body.beneficiary_name,
      beneficiary_type: body.beneficiary_type,
      location_name: body.location_name,
      demo_url: body.demo_url,
      github_url: body.github_url,
      class_id: body.class_id || null,
      mata_pelajaran_id: body.mata_pelajaran_id || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Simpan thumbnail sebagai screenshot utama kalau ada
  if (body.thumbnail_url && data.id) {
    await supabase.from('project_screenshots').insert({
      student_project_id: data.id,
      url: body.thumbnail_url,
      is_primary: true,
    })
  }

  return NextResponse.json(data, { status: 201 })
}
