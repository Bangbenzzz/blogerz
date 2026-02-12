// app/admin/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import styles from './admin.module.css'
import { approvePost, deletePost } from './actions'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    return <div className={styles.denied}><h1>[ ACCESS_DENIED ]</h1></div>
  }

  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.adminTitle}>
          <span>// ROOT_ADMIN_TERMINAL</span>
          <h1>CONTROL_CENTER</h1>
        </div>

        <div className={styles.headerRight}>
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            // {user.email}
          </span>
          <form action="/auth/signout" method="post">
            <button type="submit" className={styles.btnLogout}>Exit_</button>
          </form>
        </div>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.tableContainer}>
          <thead>
            <tr className={styles.tableHeader}>
              <th style={{width: '120px'}}>DATE</th>
              <th>AUTHOR</th>
              <th>TITLE</th>
              <th style={{width: '150px'}}>STATUS</th>
              <th style={{width: '200px'}}>OPERATIONS</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className={styles.tableRow}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                
                <td style={{color: '#14ff00', fontWeight: 'bold'}}>
                  {post.author?.email}
                </td>
                
                <td style={{fontWeight: 'bold', color: 'var(--text-main)'}}>
                  {post.title}
                </td>
                
                {/* BAGIAN STATUS DENGAN LAMPU ANIMASI */}
                <td>
                  {post.published ? (
                    <div className={styles.statusLive}>
                      <span className={styles.dotLive}></span>
                      LIVE
                    </div>
                  ) : (
                    <div className={styles.statusPending}>
                      <span className={styles.dotPending}></span>
                      PENDING
                    </div>
                  )}
                </td>
                
                <td>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                    {!post.published && (
                      <form action={approvePost.bind(null, post.id)}>
                        <button type="submit" className={styles.actionBtn}>APPROVE</button>
                      </form>
                    )}

                    <form action={deletePost.bind(null, post.id)}>
                      <button type="submit" className={`${styles.actionBtn} ${styles.btnDelete}`}>
                        DELETE
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}