// app/page.tsx
import Link from 'next/link'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import styles from './home.module.css'
import UserMenu from '@/components/UserMenu'
import PostCard from '@/components/PostCard'
import UserSearch from '@/components/UserSearch' // <--- 1. IMPORT KOMPONEN PENCARIAN

export const revalidate = 0

export default async function HomePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()

  // 1. AMBIL DATA PROFILE (Untuk Avatar Header)
  let profile = null
  if (user) {
    profile = await prisma.profile.findUnique({
      where: { id: user.id }
    })
  }

  // 2. AMBIL POSTINGAN (FEED)
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
    <div className={styles.container}>
      
      {/* --- HEADER UTAMA --- */}
      <header className={styles.header}>
        {/* Logo Kiri */}
        <div className={styles.logo}>HABIB<span> YUSRIL .</span></div>
        
        {/* Area Kanan (Search + Menu User) */}
        <div className={styles.userNav} style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          
          {user ? (
            <>
              {/* 2. PASANG SEARCH BAR DI SINI (Cuma muncul kalau sudah login) */}
              <UserSearch />
              
              {/* Menu Profil */}
              <UserMenu userEmail={user.email} avatarUrl={profile?.avatarUrl} />
            </>
          ) : (
            // Kalau belum login, muncul tombol Join
            <Link href="/login" className={styles.btnAction}>Join Community</Link>
          )}
          
        </div>
      </header>


      {/* --- KONTEN HALAMAN --- */}
      {!user ? (
        // TAMPILAN TAMU (LANDING PAGE)
        <>
          <section className={styles.hero}>
            <label>// The Digital Archive</label>
            <h1>UNLEASH YOUR <br/> <span className={styles.textOutline}>CREATIVE LOGIC.</span></h1>
            <p>Platform menulis untuk para developer dan kreatif.</p>
            <Link href="/login" className={styles.btnActionLarge}>Mulai Menulis</Link>
          </section>

          <main className={styles.feedSection}>
            <div className={styles.sectionTitle}>PREVIEW_KARYA / TOP 3</div>
            <div className={styles.postGrid}>
              {posts.slice(0, 3).map((post) => (
                 <article key={post.id} className={styles.postCard}>
                 <div>
                   <div className={styles.postMeta}>PENULIS: <span>{post.author?.name || 'MEMBER'}</span></div>
                   <h3 className={styles.postTitle}>{post.title}</h3>
                   <p className={styles.postExcerpt}>{post.content?.slice(0, 100)}...</p>
                 </div>
                 <Link href="/login" className={styles.readMore}>LOGIN UNTUK BACA <span>→</span></Link>
               </article>
              ))}
            </div>
          </main>
        </>
      ) : (
        // TAMPILAN MEMBER (TIMELINE)
        <main className={styles.feedSection} style={{marginTop: '20px'}}>
          <div className={styles.sectionTitle} style={{marginBottom: '30px'}}>TIMELINE / TERBARU</div>
          
          {posts.length === 0 ? (
            <div className={styles.emptyState}><p>Belum ada update terbaru.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user.id} />
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  )
}