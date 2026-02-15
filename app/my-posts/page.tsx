import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import ClientPostList from '../dashboard/ClientPostList'

export default async function MyPostsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  // Ambil HANYA post milik user yang sedang login
  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: { 
      likes: true,
      comments: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-[1000] bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-4 md:px-[5%] py-3 md:py-4">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Logo Biru */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3B82F6] to-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">H</span>
            </div>
            <span className="font-extrabold text-lg md:text-xl text-[var(--text-main)] hidden sm:block">
              HABIB<span className="text-[#3B82F6]">BLOG</span>
            </span>
          </Link>
          
          <Link 
            href="/dashboard" 
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[#3B82F6] transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 md:px-[5%] py-6 md:py-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-black text-[var(--text-main)]">
              Karya Saya
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Daftar karya yang telah kamu buat.
            </p>
          </div>

          {/* Menggunakan komponen yang sama dengan Dashboard */}
          <ClientPostList initialPosts={posts} />
        </div>
      </main>
    </div>
  )
}