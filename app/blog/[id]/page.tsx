// app/blog/[id]/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import styles from './blog.module.css'

export default async function BlogDetail({ params }: { params: { id: string } }) {
  // 1. Inisialisasi Cookie & Supabase
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  // 2. CEK SATPAM: Apakah user sedang login?
  const { data: { user } } = await supabase.auth.getUser()

  // Kalau belum login, langsung otomatis dilempar ke halaman login
  if (!user) {
    redirect('/login')
  }

  // 3. Tarik data artikel dari Prisma berdasarkan ID dari URL
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: true }
  })

  // 4. Kalau artikel tidak ditemukan atau belum di-publish
  if (!post || !post.published) {
    return (
      <div className={styles.errorState}>
        <h1>[ 404_NOT_FOUND ]</h1>
        <p>Data stream missing or access denied.</p>
        <Link href="/" style={{ color: 'var(--accent)', marginTop: '20px' }}>&lt; Return to Base</Link>
      </div>
    )
  }

  // 5. Tampilkan Artikel Full jika semuanya aman
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>HABIB<span> YUSRIL .</span></Link>
        <Link href="/" className={styles.btnBack}>&lt; KEMBALI</Link>
      </header>

      <article className={styles.content}>
        <div className={styles.meta}>
          <div>AUTHOR: <span>{post.author?.name || 'ADMIN'}</span></div>
          <div>DATE: <span>{new Date(post.createdAt).toLocaleDateString()}</span></div>
        </div>
        
        <h1 className={styles.title}>{post.title}</h1>
        
        {/* Konten artikel */}
        <div className={styles.body}>
          {post.content}
        </div>
      </article>
    </div>
  )
}