'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import styles from './dashboard.module.css'
import { showToast } from '@/components/Toast' // Pastikan path Toast benar

export default function ClientPostList({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // LOGIKA HAPUS POSTINGAN
  const handleDelete = async (postId: string) => {
    // 1. Konfirmasi Browser Standar (Bisa diganti Modal Custom jika mau)
    const confirmDelete = window.confirm("Yakin ingin menghapus tulisan ini selamanya?")
    if (!confirmDelete) return

    setIsDeleting(true)

    try {
      // 2. Panggil API/Server Action untuk hapus (contoh pakai fetch API)
      // Jika Anda pakai Server Action, ganti bagian ini. 
      // Ini contoh universal pakai API Route:
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      
      if (!res.ok) throw new Error("Gagal menghapus")

      // 3. Update UI Tanpa Refresh Halaman (Optimistic UI)
      setPosts(posts.filter(p => p.id !== postId))
      showToast("Tulisan berhasil dihapus", "success")
      router.refresh()

    } catch (error) {
      console.error(error)
      showToast("Gagal menghapus tulisan", "error")
    } finally {
      setIsDeleting(false)
    }
  }
  
  // Jika tidak ada postingan
  if (!posts || posts.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 0', 
        color: 'var(--text-muted)',
        fontSize: '14px',
        border: '1px dashed var(--border-color)',
        borderRadius: '12px'
      }}>
        Belum ada karya. Mulai menulis sekarang!
      </div>
    )
  }

  return (
    <div className={styles.postListContainer}>
      {posts.map((post) => (
        <div key={post.id} className={styles.postCard}>
          <div className={styles.postInfo}>
            {/* Judul Artikel */}
            <Link href={`/post/${post.slug || '#'}`} className={styles.postTitle}>
              {post.title}
            </Link>
            
            {/* Meta Data: Tanggal & Status */}
            <div className={styles.postMeta}>
              <span>
                {new Date(post.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              
              <span className={styles.dot}>•</span>
              
              {/* LOGIKA STATUS WARNA */}
              {post.published ? (
                <span className={styles.statusPublished}>Published</span>
              ) : (
                <span className={styles.statusPending}>Pending</span>
              )}
            </div>
          </div>

          {/* AKSI TOMBOL (EDIT & HAPUS) */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Tombol Edit */}
            <Link href={`/dashboard/write?id=${post.id}`} className={styles.btnEditPost}>
              Edit
            </Link>

            {/* Tombol Hapus (DIKEMBALIKAN) */}
            <button 
              onClick={() => handleDelete(post.id)}
              disabled={isDeleting}
              className={styles.btnDeletePost} // Class baru, lihat CSS di bawah
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}