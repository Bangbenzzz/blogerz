import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { AdminHeader } from '@/components/AdminHeader'
import AdminUsersClient from './AdminUsersClient'

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="h-screen bg-[var(--bg-main)] flex items-center justify-center text-red-500 font-mono text-xl p-4 text-center">
        <h1>[ ACCESS_DENIED ]</h1>
      </div>
    )
  }

  const pendingCount = await prisma.post.count({
    where: { published: false }
  })

  const users = await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] font-sans pt-20 pb-10">
      <AdminHeader 
        currentPage="Users"
        userEmail={user.email}
        pendingCount={pendingCount}
      />
      
      <div className="px-4 md:px-[10%] mt-6">
        {/* Props sudah sesuai dengan yang dibutuhkan Client Component */}
        <AdminUsersClient initialUsers={users} currentAdminId={user.id} />
      </div>
    </div>
  )
}