import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import PostDetailClient from './PostDetailClient'

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id: id },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: 'asc' }
      },
      likes: true
    }
  })

  if (!post || !post.published) {
    notFound()
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-4 md:px-[5%] py-3">
          <Link href="/" className="flex items-center gap-2 group">
            {/* Logo Biru */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-blue-700 flex items-center justify-center">
              <span className="text-white font-black">H</span>
            </div>
            <span className="font-extrabold text-lg text-[var(--text-main)] hidden sm:block">
              HABIB<span className="text-[#3B82F6]">BLOG</span>
            </span>
          </Link>
          <Link 
            href="/" 
            // Hover Biru
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
      <PostDetailClient 
        post={post} 
        currentUserId={user.id} 
        currentProfile={profile} 
        userEmail={user.email}
      />
    </div>
  )
}