// components/LikeButton.tsx
'use client'

import { useState } from 'react'
import { toggleLike } from '@/app/actions' // Pastikan ini mengarah ke actions utama
import { useRouter } from 'next/navigation'

export default function LikeButton({ post, currentUserId }: { post: any, currentUserId?: string }) {
  const router = useRouter()
  
  // Cek apakah user sudah like postingan ini
  const isLikedInitial = post.likes.some((like: any) => like.authorId === currentUserId)
  
  const [liked, setLiked] = useState(isLikedInitial)
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!currentUserId) {
      return alert("Login dulu bro kalau mau like!")
    }
    if (loading) return

    // Optimistic UI (Langsung berubah warnanya biar berasa cepet)
    const newLikedState = !liked
    setLiked(newLikedState)
    
    // Perbaikan: Tambahkan tipe (prev: number) biar tidak error merah
    setLikeCount((prev: number) => newLikedState ? prev + 1 : prev - 1)
    
    setLoading(true)
    
    // Kirim ke Server
    const res = await toggleLike(post.id)
    
    if (!res?.success) {
      // Kalau gagal, balikin lagi statusnya (Rollback)
      setLiked(!newLikedState)
      setLikeCount((prev: number) => !newLikedState ? prev + 1 : prev - 1)
    }
    
    setLoading(false)
    router.refresh()
  }

  return (
    <button 
      onClick={handleLike}
      disabled={loading}
      style={{
        background: 'transparent', 
        border: 'none', 
        cursor: 'pointer',
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        color: liked ? '#ff4444' : 'var(--text-muted)', // Merah kalau liked, abu kalau belum
        fontSize: '13px',
        transition: '0.2s'
      }}
    >
      <span style={{fontSize: '16px'}}>
        {liked ? '❤️' : '🤍'} 
      </span>
      <span>{likeCount} Like</span>
    </button>
  )
}