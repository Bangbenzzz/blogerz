// app/user/[username]/page.tsx

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostCard from '@/components/PostCard'
import UserMenu from '@/components/UserMenu'
import styles from '@/app/dashboard/dashboard.module.css' 

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  // AWAIT PARAMS (Wajib di Next.js terbaru)
  const { username } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // Ambil Avatar User yang sedang login (untuk Header)
  let myProfile = null
  if (currentUser) {
    myProfile = await prisma.profile.findUnique({ where: { id: currentUser.id } })
  }

  // 1. CARI USER TARGET BERDASARKAN USERNAME DARI URL
  const targetUsername = decodeURIComponent(username)

  const targetUser = await prisma.profile.findUnique({
    where: { username: targetUsername }
  })

  // Kalau user tidak ditemukan di database -> 404 Not Found
  if (!targetUser) return notFound() 

  // 2. AMBIL TULISAN/ARTIKEL MEREKA
  const userPosts = await prisma.post.findMany({
    where: { 
      authorId: targetUser.id,
      published: true 
    },
    include: {
      author: true,
      likes: true,
      comments: { include: { author: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className={styles.container}>
      {/* HEADER KHUSUS PROFIL PUBLIK */}
      <header className={styles.header}>
        <div className={styles.title}>
          <span>PROFILE VIEW</span>
          <h1>@{targetUser.username?.toUpperCase()}</h1>
        </div>
        
        <div className={styles.headerActions}>
          {/* HAPUS SIMBOL < */}
          <Link href="/" className={styles.btnBack}>Home</Link>
          {currentUser ? (
            <div style={{marginLeft: '15px'}}>
               <UserMenu userEmail={currentUser.email} avatarUrl={myProfile?.avatarUrl} />
            </div>
          ) : (
            <Link href="/login" className={styles.btnNew}>Login</Link>
          )}
        </div>
      </header>

      <main className={styles.content}>
        
        {/* KARTU IDENTITAS USER LAIN */}
        <div className={styles.profileCard} style={{marginBottom: '50px', alignItems: 'center'}}>
          <div className={styles.avatarSection}>
            {/* HAPUS BORDER NEON DISINI (Cukup border radius saja) */}
            <div className={styles.avatarWrapper} style={{ border: 'none' }}> 
              {targetUser.avatarUrl ? (
                <img src={targetUser.avatarUrl} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
              ) : (
                <div className={styles.avatarPlaceholder}>{targetUser.name?.[0]}</div>
              )}
            </div>
          </div>
          
          <div className={styles.infoSection}>
            <h2 style={{fontSize: '24px', margin: 0}}>{targetUser.name}</h2>
            <div style={{color: 'var(--accent)', fontFamily: 'monospace', marginBottom: '10px'}}>
              @{targetUser.username}
            </div>
            <p style={{color: 'var(--text-muted)', lineHeight: '1.6'}}>
              {targetUser.bio || "User ini belum menulis bio apapun."}
            </p>
            <div style={{marginTop: '10px', fontSize: '12px', fontWeight: 'bold', color: 'gray'}}>
              BERGABUNG SEJAK: {new Date(targetUser.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* DAFTAR TULISAN MEREKA */}
        <div className={styles.sectionTitle}>
           KARYA PUBLIK ({userPosts.length})
        </div>
        
        {userPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>User ini belum menerbitkan artikel apapun.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}