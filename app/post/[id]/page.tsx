import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import PostDetailClient from './PostDetailClient'

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  let id: string;
  try {
    const resolvedParams = await params;
    id = resolvedParams.id;
  } catch (e) {
    notFound();
    return;
  }

  let user: any = null;
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    )
    const { data: { user: userData } } = await supabase.auth.getUser()
    user = userData;
  } catch (error) {
    console.error("Auth error:", error)
  }

  if (!user) {
    redirect('/login')
  }

  let post: any = null;
  try {
    post = await prisma.post.findUnique({
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
  } catch (error) {
    console.error("Database error:", error)
    notFound()
  }

  if (!post || !post.published) {
    notFound()
  }

  let profile: any = null;
  try {
    profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })
  } catch (error) {
    console.error("Profile fetch error")
  }

  const safePost = {
    ...post,
    content: post.content || '',
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-4 md:px-[5%] py-3">
          
          {/* Logo - Ukuran Standar */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center overflow-hidden">
              <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            
            {/* Teks CERMATI */}
            <span className="font-extrabold text-lg md:text-xl">
              <span className="text-white">CER</span>
              <span className="text-[#3B82F6]">MATI</span>
            </span>
          </Link>

          <Link 
            href="/" 
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[#3B82F6] transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali
          </Link>
        </div>
      </header>

      {/* Content */}
      <PostDetailClient 
        post={safePost} 
        currentUserId={user.id} 
        currentProfile={profile} 
        userEmail={user.email}
      />
    </div>
  )
}