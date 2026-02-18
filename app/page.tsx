import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import UserMenu from '@/components/UserMenu'
import UserSearch from '@/components/UserSearch'
import VerifiedBadge from '@/components/VerifiedBadge'
import TypewriterText from '@/components/TypewriterText'
import PostCard from '@/components/PostCard'
import DynamicLogo from '@/components/DynamicLogo'
import Footer from '@/components/Footer'

export const revalidate = 0

// Fungsi helper untuk membersihkan HTML
function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '')
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  let profile: any = null
  if (user) {
    profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })

    if (profile?.isBanned) {
      redirect('/banned')
    }
  }

  // === AMBIL SETTINGS DARI DB UNTUK DESKRIPSI ===
  const settingsRaw = await prisma.setting.findMany()
  const settings: Record<string, string> = {}
  settingsRaw.forEach((s: any) => (settings[s.key] = s.value))

  const siteDescription =
    settings.site_description ||
    'Platform menulis untuk para developer dan kreatif. Bagikan cerita, tutorial, dan ide-ide brilianmu.'

  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: true,
      likes: true,
      comments: { include: { author: true }, orderBy: { createdAt: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const partners = await prisma.partner.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    // ✅ FIX: HAPUS overflow-x-hidden dari sini
    <div className="min-h-screen bg-transparent flex flex-col">

      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-[999999] bg-[var(--bg-main)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <DynamicLogo />

            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
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
                    className="flex items-center gap-1.5 bg-[#3B82F6] text-white py-2 px-3 md:px-4 text-[11px] font-bold rounded-full hover:bg-[#2563EB] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
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
                <Link
                  href="/login"
                  className="bg-[#3B82F6] border border-[#3B82F6] text-white py-2 px-5 text-[11px] font-extrabold uppercase rounded-full hover:bg-[#2563EB] hover:border-[#2563EB] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all whitespace-nowrap"
                >
                  Join Community
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      


      {/* ========== CONTENT ========== */}
      {!user ? (
        // ===== GUEST VIEW =====
        <div className="flex-grow w-full">
          {/* HERO SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
            <div className="max-w-4xl w-full">
              <div className="inline-flex items-center gap-2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                <span className="text-xs font-mono text-[#3B82F6]">// Platform Kreatif</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 text-[var(--text-main)] break-words">
                UNLEASH YOUR<br />
                <TypewriterText />
              </h1>

              <p className="w-full max-w-lg text-base md:text-lg text-[var(--text-muted)] mb-8 leading-relaxed text-left break-words break-all">
                {siteDescription}
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="bg-[#3B82F6] border border-[#3B82F6] text-white py-3 px-7 text-sm font-extrabold uppercase rounded-full hover:bg-[#2563EB] hover:border-[#2563EB] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all"
                >
                  Mulai Menulis
                </Link>
                <Link
                  href="#posts"
                  className="bg-transparent border border-[var(--border-color)] text-[var(--text-main)] py-3 px-7 text-sm font-bold rounded-full hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all"
                >
                  Jelajahi Karya
                </Link>
              </div>
            </div>
          </section>

          {/* PARTNERS SLIDER */}
          {partners.length > 0 && (
            <section className="py-12 bg-[var(--bg-card)] mb-12 w-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-[0.3em] font-bold">
                  SUPPORTED BY
                </p>
              </div>

              <div
                className="relative overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
                }}
              >
                <div className="animate-marquee-right hover:pause-animation">
                  {[...partners, ...partners].map((partner, idx) => (
                    <div
                      key={partner.id + idx}
                      className="inline-flex items-center justify-center px-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
                      title={partner.name}
                    >
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="h-10 md:h-14 w-auto object-contain max-w-[180px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* POSTS PREVIEW (GUEST) */}
          <main id="posts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 w-full">
            <h2 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-8">
              // Preview Karya
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(0, 6).map((post) => {
                const cleanContent = post.content ? stripHtml(post.content) : ''
                return (
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
                      <h3 className="text-lg font-bold text-[var(--text-main)] mb-2 group-hover:text-[#3B82F6] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed break-words">
                        {cleanContent.slice(0, 120)}...
                      </p>
                    </div>

                    <div className="px-4 pb-4">
                      <Link href="/login" className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1">
                        Login untuk baca
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </main>
        </div>
      ) : (
        // ===== MEMBER VIEW (FEED) =====
        // 🔴 PERUBAHAN DI SINI:
        // Ganti 'pt-6' menjadi 'pt-24 md:pt-28'
        // Ini memberi jarak padding atas yang cukup agar kartu turun melewati fixed header
        <main className="flex-grow w-full pb-20 pt-24 md:pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto w-full">
              <div className="mb-6">
                <p className="text-sm text-[var(--text-muted)]">
                  Selamat datang kembali,{' '}
                  <span className="text-[#3B82F6] font-bold">{profile?.name || 'User'}</span>
                </p>
              </div>

              {posts.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)]/50">
                  <p className="text-[var(--text-muted)] mb-4">Belum ada update terbaru.</p>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 bg-[#3B82F6] text-white py-2 px-5 text-sm font-bold rounded-full hover:bg-[#2563EB] transition-all"
                  >
                    Buat Karya Pertama
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post as any} currentUserId={user.id} userEmail={user.email} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  )
}
