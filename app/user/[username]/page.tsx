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
      
      {/* --- HEADER PROFIL (GARIS FULL WIDTH) --- */}
      <header className={`${styles.header} ${styles.profilePageHeader}`}>
        
        {/* Pembungkus baru: Konten diatur padding 5% biar sejajar dengan postingan, 
            tapi garis header tetap full layar */}
        <div className={styles.profileHeaderInner}>
          
          {/* Bagian Kiri: Judul */}
          <div className={styles.profileHeaderTitle}>
            <span>PROFILE VIEW</span>
            <h1>@{targetUser.username?.toUpperCase()}</h1>
          </div>
          
          {/* Bagian Kanan: Aksi */}
          <div className={styles.profileActions}>
            <Link href="/" className={styles.btnAction}>
               Home
            </Link>
            
            {currentUser ? (
               <UserMenu userEmail={currentUser.email} avatarUrl={myProfile?.avatarUrl} />
            ) : (
               <Link href="/login" className={styles.btnAction}>
                 Login
               </Link>
            )}
          </div>
          
        </div>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <main className={styles.profileContent}>
        
        {/* KARTU IDENTITAS USER */}
        <div className={styles.profileIdentityCard}>
          <div className={styles.avatarWrapper} style={{ border: 'none', width: '100px', height: '100px' }}> 
            {targetUser.avatarUrl ? (
              <img 
                src={targetUser.avatarUrl} 
                alt="avatar" 
                style={{width: '100%', height: '100%', objectFit:'cover'}} 
              />
            ) : (
              <div className={styles.avatarPlaceholder} style={{
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '40px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)'
              }}>
                {targetUser.name?.[0]}
              </div>
            )}
          </div>
          
          <h2>{targetUser.name}</h2>
          
          <div style={{color: 'var(--accent)', fontFamily: 'monospace', marginTop: '5px', fontSize: '14px'}}>
            @{targetUser.username}
          </div>
          
          <p className={styles.profileBio}>
            {targetUser.bio || "User ini belum menulis bio apapun."}
          </p>
          
          <div style={{marginTop: '15px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', fontFamily: 'monospace'}}>
            BERGABUNG SEJAK: {new Date(targetUser.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* DAFTAR TULISAN MEREKA */}
        <div className={styles.sectionTitle} style={{padding: 0, border: 'none'}}>
           KARYA PUBLIK ({userPosts.length})
        </div>
        
        {userPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>User ini belum menerbitkan artikel apapun.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '20px' }}>
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}