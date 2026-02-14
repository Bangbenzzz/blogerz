import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import CreatePostClient from './CreatePostClient'

export default async function CreatePostPage() {
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

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-4 md:px-[5%] py-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-green-700 flex items-center justify-center">
              <span className="text-black font-black">H</span>
            </div>
            <span className="font-extrabold text-lg text-[var(--text-main)] hidden sm:block">
              HABIB<span className="text-[var(--accent)]">BLOG</span>
            </span>
          </Link>
          <Link 
            href="/" 
            className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Batal
          </Link>
        </div>
      </header>

      {/* Content */}
      <CreatePostClient userId={user.id} profile={profile} />
    </div>
  )
}