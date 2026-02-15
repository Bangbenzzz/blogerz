import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import UserSearch from '@/components/UserSearch'

export default async function DashboardPage() {
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

          <div className="flex items-center gap-2 md:gap-3">
            {user.email === process.env.ADMIN_EMAIL && (
              <Link 
                href="/admin" 
                // Tombol Admin Biru
                className="hidden sm:flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] py-2 px-4 text-[11px] font-bold rounded-full hover:bg-[#3B82F6] hover:text-white transition-all"
              >
                Admin
              </Link>
            )}

            <Link
              href="/create"
              // Tombol Buat Karya Biru
              className="flex items-center gap-1.5 bg-[#3B82F6] text-white py-2 px-3 md:px-4 text-[11px] font-bold rounded-full hover:bg-[#2563EB] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span className="hidden md:inline">Buat Karya</span>
            </Link>

            <UserSearch />
            <UserMenu 
              userEmail={user.email}
              avatarUrl={profile?.avatarUrl}
              username={profile?.username}
              name={profile?.name}
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 md:px-[5%] py-6 md:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Profile Section */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--border-color)]">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  // Avatar Placeholder Biru
                  <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-blue-700 flex items-center justify-center">
                    <span className="text-3xl font-black text-white">
                      {profile?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[var(--text-main)]">
                  {profile?.name || 'User'}
                </h1>
                <p className="text-sm text-[var(--text-muted)]">
                  @{profile?.username || 'username'}
                </p>
              </div>
            </div>

            {profile?.bio && (
              <p className="text-sm text-[var(--text-muted)] mb-6">
                {profile.bio}
              </p>
            )}

            <Link
              href="/settings"
              // Hover Border Biru
              className="inline-flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border-color)] py-2 px-4 text-sm font-bold rounded-full hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Edit Profil
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-[var(--text-main)]">{posts.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Karya</p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-[var(--text-main)]">
                {posts.reduce((acc, p) => acc + p.likes.length, 0)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Likes</p>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-[var(--text-main)]">
                {posts.reduce((acc, p) => acc + p.comments.length, 0)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">Komentar</p>
            </div>
          </div>

          {/* Posts */}
          <h2 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">
            // Karya Saya ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[var(--text-muted)] mb-4">Belum ada karya.</p>
              <Link
                href="/create"
                // Tombol Biru
                className="inline-flex items-center gap-2 bg-[#3B82F6] text-white py-2 px-5 text-sm font-bold rounded-full hover:bg-[#2563EB] transition-all"
              >
                Buat Karya Pertama
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div 
                  key={post.id}
                  // Hover Border Biru
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[#3B82F6]/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[var(--text-main)] truncate">
                        {post.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {post.likes.length} likes • {post.comments.length} komentar
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold rounded flex-shrink-0 ${
                      post.published 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-orange-500/20 text-orange-500'
                    }`}>
                      {post.published ? 'PUBLISHED' : 'PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}