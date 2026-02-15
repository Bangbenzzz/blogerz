import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import UserMenu from '@/components/UserMenu'
import PostCard from '@/components/PostCard'
import UserSearch from '@/components/UserSearch'
import VerifiedBadge from '@/components/VerifiedBadge'
import TypewriterText from '@/components/TypewriterText'

export const revalidate = 0

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })
  }

  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { 
      author: true, 
      likes: true, 
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-transparent">
      
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-[1000] bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center px-4 md:px-[5%] py-3 md:py-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Gradient Biru */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3B82F6] to-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">H</span>
            </div>
            <span className="font-extrabold text-lg md:text-xl text-[var(--text-main)] hidden sm:block">
              HABIB<span className="text-[#3B82F6]">BLOG</span>
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {user ? (
              <>
                {/* Admin Button */}
                {user.email === process.env.ADMIN_EMAIL && (
                  <Link 
                    href="/admin" 
                    className="hidden sm:flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-500 py-2 px-4 text-[11px] font-bold rounded-full hover:bg-purple-500 hover:text-white transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Admin
                  </Link>
                )}

                {/* Create Post Button - Biru (FIXED) */}
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 bg-[#3B82F6] text-white py-2 px-3 md:px-4 text-[11px] font-bold rounded-full hover:bg-[#2563EB] transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              </>
            ) : (
              <>
                {/* Login Button (Untuk Guest) - Biru (FIXED) */}
                <Link 
                  href="/login" 
                  className="bg-[#3B82F6] border border-[#3B82F6] text-white py-2 px-5 text-[11px] font-extrabold uppercase rounded-full hover:bg-[#2563EB] hover:border-[#2563EB] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                >
                  Join Community
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========== CONTENT ========== */}
      {!user ? (
        // ===== GUEST VIEW =====
        <>
          <section className="px-4 md:px-[5%] py-16 md:py-24 lg:py-32">
            <div className="max-w-4xl">
              {/* Badge Biru */}
              <div className="inline-flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"/>
                <span className="text-xs font-mono text-[#3B82F6]">// Platform Kreatif</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 text-[var(--text-main)]">
                UNLEASH YOUR<br/>
                <TypewriterText />
              </h1>
              
              <p className="text-base md:text-lg text-[var(--text-muted)] max-w-xl mb-8 leading-relaxed">
                Platform menulis untuk para developer dan kreatif. Bagikan cerita, tutorial, dan ide-ide brilianmu.
              </p>

              <div className="flex flex-wrap gap-3">
                {/* Tombol Biru (FIXED) */}
                <Link 
                  href="/login" 
                  className="bg-[#3B82F6] border border-[#3B82F6] text-white py-3 px-7 text-sm font-extrabold uppercase rounded-full hover:bg-[#2563EB] hover:border-[#2563EB] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all"
                >
                  Mulai Menulis
                </Link>
                {/* Hover Border Biru */}
                <Link 
                  href="#posts" 
                  className="bg-transparent border border-[var(--border-color)] text-[var(--text-main)] py-3 px-7 text-sm font-bold rounded-full hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all"
                >
                  Jelajahi Karya
                </Link>
              </div>
            </div>
          </section>

          <main id="posts" className="px-4 md:px-[5%] py-12 md:py-20">
            <h2 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-8">
              // Preview Karya
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((post) => (
                <article 
                  key={post.id} 
                  className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden transition-all hover:border-[#3B82F6]/50 hover:-translate-y-1"
                >
                  <div className="p-4 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-color)]">
                        {post.author.avatarUrl ? (
                          <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {post.author.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-[var(--text-main)]">
                          {post.author.name || 'Member'}
                        </span>
                        {post.author.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Hover Title Biru */}
                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                      {post.content?.slice(0, 120)}...
                    </p>
                  </div>

                  <div className="px-4 pb-4">
                    {/* Link Biru */}
                    <Link 
                      href="/login" 
                      className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1"
                    >
                      Login untuk baca
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </main>
        </>
      ) : (
        // ===== MEMBER VIEW =====
        <main className="w-full pb-20 pt-4 md:pt-6">
          <div className="px-4 md:px-[5%] mb-6">
            <p className="text-sm text-[var(--text-muted)]">
              Selamat datang kembali, <span className="text-[#3B82F6] font-bold">{profile?.name || 'User'}</span>
            </p>
          </div>

          <div className="w-full px-4 md:px-[5%]">
            {posts.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[var(--text-muted)] mb-4">Belum ada update terbaru.</p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 bg-[#3B82F6] text-white py-2 px-5 text-sm font-bold rounded-full hover:bg-[#2563EB] transition-all"
                >
                  Buat Karya Pertama
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4 md:gap-5 max-w-2xl mx-auto lg:max-w-3xl">
                {posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUserId={user.id}
                    userEmail={user.email} 
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  )
}