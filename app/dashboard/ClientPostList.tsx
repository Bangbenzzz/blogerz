'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'

export default function ClientPostList({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleDelete = async (postId: string) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus tulisan ini selamanya?")
    if (!confirmDelete) return

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      
      if (!res.ok) throw new Error("Gagal menghapus")

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
  
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)] text-sm border border-dashed border-[var(--border-color)] rounded-xl">
        Belum ada karya. Mulai menulis sekarang!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-5 rounded-xl flex justify-between items-center transition-all hover:border-[var(--text-muted)]">
          <div className="flex flex-col gap-1">
            <Link href={`/post/${post.slug || '#'}`} className="text-lg font-bold text-[var(--text-main)] hover:underline">
              {post.title}
            </Link>
            
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>
                {new Date(post.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
              <span className="text-[8px] opacity-50">•</span>
              
              {post.published ? (
                <span className="border border-cyan-400 text-cyan-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-400/10 shadow-[0_0_8px_rgba(0,210,255,0.2)]">
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
            <Link href={`/dashboard/write?id=${post.id}`} className="py-1.5 px-3 border border-[var(--border-color)] rounded-lg text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--text-main)] hover:text-[var(--bg-main)] transition-colors">
              Edit
            </Link>

            <button 
              onClick={() => handleDelete(post.id)}
              disabled={isDeleting}
              className="py-1.5 px-3 border border-red-500 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}