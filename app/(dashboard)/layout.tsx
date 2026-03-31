import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()

  if (!profile) redirect('/login')
  if (profile.role === 'siswa' && !profile.is_verified) redirect('/pending-verification')

  return (
    <div className="min-h-screen flex bg-[#f8f7ff]">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 p-4 lg:p-6 overflow-auto pt-16 lg:pt-6">{children}</main>
    </div>
  )
}
