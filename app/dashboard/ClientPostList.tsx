'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { showToast } from '@/components/Toast'

export default function ClientPostList({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // State untuk Modal Custom
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Buka Modal
  const openDeleteModal = (postId: string) => {
    setSelectedPostId(postId)
    setShowDeleteModal(true)
  }

  // Tutup Modal
  const closeDeleteModal = () => {
    setSelectedPostId(null)
    setShowDeleteModal(false)
  }

  // Eksekusi Hapus
  const handleDelete = async () => {
    if (!selectedPostId) return

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/posts/${selectedPostId}`, { method: 'DELETE' })
      
      if (!res.ok) throw new Error("Gagal menghapus")

      setPosts(posts.filter(p => p.id !== selectedPostId))
      showToast("Tulisan berhasil dihapus", "success")
      router.refresh()
      closeDeleteModal() // Tutup modal setelah sukses

    } catch (error) {
      console.error(error)
      showToast("Gagal menghapus tulisan", "error")
    } finally {
      setIsDeleting(false)
    }
  }
  
  // PERBAIKAN HYDRATION: Format tanggal manual UTC
  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm border border-dashed border-[var(--border-color)] rounded-xl">
        Belum ada karya. Mulai menulis sekarang!
      </div>
    )
  }

  return (
    <>
      {/* MODAL KONFIRMASI HAPUS (CUSTOM STYLING) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-main)] border border-red-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Hapus Tulisan Ini?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={closeDeleteModal} 
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST POSTS */}
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl flex justify-between items-center transition-all hover:border-[#3B82F6]/50">
            <div className="flex flex-col gap-1">
              <Link href={`/post/${post.slug || '#'}`} className="text-lg font-bold text-[var(--text-main)] hover:text-[#3B82F6] transition-colors">
                {post.title}
              </Link>
              
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span>
                  {formatDate(post.createdAt)}
                </span>
                <span className="text-[8px] opacity-50">•</span>
                
                {post.published ? (
                  <span className="border border-[#3B82F6] text-[#3B82F6] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#3B82F6]/10 shadow-[0_0_8px_rgba(59,130,246,0.2)]">
                    Published
                  </span>
                ) : (
                  <span className="border border-orange-500 text-orange-500 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/10 shadow-[0_0_8px_rgba(255,136,0,0.2)]">
                    Pending
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {/* PERUBAHAN: Tombol Edit mengarah ke /create?id=... */}
              <Link 
                href={`/create?id=${post.id}`} 
                className="py-1.5 px-3 border border-[var(--border-color)] rounded-lg text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors"
              >
                Edit
              </Link>

              <button 
                onClick={() => openDeleteModal(post.id)} // Panggil modal custom
                disabled={isDeleting}
                className="py-1.5 px-3 border border-red-500 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}