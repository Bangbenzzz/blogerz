import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import UserSearch from '@/components/UserSearch'
import PostCard from '@/components/PostCard'
import VerifiedBadge from '@/components/VerifiedBadge'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Props {
  params: Promise<{ username: string }> // Tipe diubah menjadi Promise
}

export default async function UserProfilePage({ params }: Props) {
  // 1. Ambil cookies dan user (tetap sama)
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()

  // 2. PERBAIKAN: Await params sebelum mengakses username
  const { username } = await params

  // 3. Gunakan username yang sudah di-await
  const profile = await prisma.profile.findUnique({
    where: { username: username }
  })

  if (!profile) {
    notFound()
  }

  const currentUserProfile = user ? await prisma.profile.findUnique({
    where: { id: user.id }
  }) : null

  const posts = await prisma.post.findMany({
    where: { 
      authorId: profile.id,
      published: true 
    },
    include: { 
      author: true, 
      likes: true, 
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-[1000] bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-4 md:px-[5%] py-3 md:py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent)] to-green-700 flex items-center justify-center">
              <span className="text-black font-black text-lg">H</span>
            </div>
            <span className="font-extrabold text-lg md:text-xl text-[var(--text-main)] hidden sm:block">
              HABIB<span className="text-[var(--accent)]">BLOG</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            {user ? (
              <>
                {user.email === process.env.ADMIN_EMAIL && (
                  <Link 
                    href="/admin" 
                    className="hidden sm:flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-500 py-2 px-4 text-[11px] font-bold rounded-full hover:bg-purple-500 hover:text-white transition-all"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  href="/create"
                  className="flex items-center gap-1.5 bg-[var(--accent)] text-black py-2 px-3 md:px-4 text-[11px] font-bold rounded-full hover:bg-white transition-all"
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
                  avatarUrl={currentUserProfile?.avatarUrl}
                  username={currentUserProfile?.username}
                  name={currentUserProfile?.name}
                />
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link 
                  href="/login" 
                  className="bg-[var(--accent)] border border-[var(--accent)] text-black py-2 px-5 text-[11px] font-extrabold uppercase rounded-full hover:bg-white transition-all"
                >
                  Join Community
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 md:px-[5%] py-6 md:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Profile */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--border-color)] mx-auto mb-4">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-4xl font-black text-white">
                    {profile.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-black text-[var(--text-main)]">
                {profile.name || 'User'}
              </h1>
              {profile.isVerified && <VerifiedBadge size="md" />}
            </div>

            <p className="text-sm text-[var(--text-muted)] mb-3">
              @{profile.username || 'username'}
            </p>

            {profile.bio && (
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                {profile.bio}
              </p>
            )}
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
            // Karya ({posts.length})
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[var(--text-muted)]">Belum ada karya yang dipublikasi.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user?.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}