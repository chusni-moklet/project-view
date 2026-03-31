import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const projectId = formData.get('projectId') as string

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // Validasi ukuran & tipe
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
    return NextResponse.json({ error: 'Format file tidak didukung' }, { status: 400 })
  }

  const fileName = `${user.id}/${projectId || 'temp'}-${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('project-images')
    .upload(fileName, file, { upsert: true, contentType: file.type })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage
    .from('project-images')
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl, path: data.path })
}
