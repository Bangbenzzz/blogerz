import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { AdminHeader } from '@/components/AdminHeader'
import AdminPostsClient from './AdminPostsClient'

export default async function AdminPage() {
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

  // Get pending posts count for notification bell
  const pendingCount = await prisma.post.count({
    where: { published: false }
  })

  // Get all posts
  const posts = await prisma.post.findMany({
    include: { 
      author: true,
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
      likes: true
    },
    orderBy: { createdAt: 'desc' }
  })

  const adminProfile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] font-sans pb-10">
      
      <AdminHeader 
        currentPage="Posts"
        userEmail={user.email}
        pendingCount={pendingCount}
      />

      {/* Stats */}
      <div className="px-4 md:px-[10%] mb-6 mt-6">
        <div className="flex gap-3 flex-wrap">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2 rounded-lg">
            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Total</span>
            <div className="text-lg font-bold text-[var(--text-main)]">{posts.length}</div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2 rounded-lg">
            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Published</span>
            <div className="text-lg font-bold text-green-500">{posts.filter(p => p.published).length}</div>
          </div>
          {/* Menambahkan warna biru pada statistik Comments untuk konsistensi dengan Dashboard */}
          <div className="bg-[var(--bg-card)] border border-[#3B82F6]/30 px-4 py-2 rounded-lg">
            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Pending</span>
            <div className="text-lg font-bold text-[#3B82F6]">{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-[10%]">
        <AdminPostsClient posts={posts} adminId={user.id} adminProfile={adminProfile} />
      </div>
    </div>
  )
}