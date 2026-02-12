// components/CommentSection.tsx
'use client'

import { useState } from 'react'
import { postComment, deleteComment } from '@/app/actions' // <--- Jangan lupa import deleteComment
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CommentSection({ post, currentUserId }: { post: any, currentUserId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // 1. FUNGSI KIRIM KOMENTAR
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) return alert("Login dulu bro!")
    if (!commentText.trim()) return

    setIsSubmitting(true)
    
    const formData = new FormData()
    formData.append('content', commentText)
    
    await postComment(post.id, formData)
    
    setCommentText('') 
    setIsSubmitting(false)
    router.refresh()
  }

  // 2. FUNGSI HAPUS KOMENTAR
  const handleDelete = async (commentId: string) => {
    if (!confirm("Yakin mau hapus komentar ini?")) return
    
    await deleteComment(commentId)
    router.refresh() // Refresh agar komentar hilang dari layar
  }

  // Toggle buka/tutup
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-muted)', 
          fontSize: '12px', 
          cursor: 'pointer', 
          marginTop: '10px',
          textDecoration: 'underline'
        }}
      >
        Lihat {post.comments.length} Komentar...
      </button>
    )
  }

  return (
    <div style={{
        marginTop: '15px', 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '15px'
    }}>
      
      {/* DAFTAR KOMENTAR */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px'}}>
        {post.comments.map((comment: any) => {
          
          // CEK APAKAH INI KOMENTAR SAYA?
          const isMyComment = currentUserId === comment.authorId

          return (
            <div key={comment.id} style={{display: 'flex', gap: '10px'}}>
              
              {/* Foto User */}
              <div style={{
                  width: '24px', height: '24px', 
                  borderRadius: '50%', overflow: 'hidden', flexShrink: 0, 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-color)'
              }}>
                {comment.author?.avatarUrl ? (
                  <Image src={comment.author.avatarUrl} alt="av" width={24} height={24} style={{objectFit:'cover'}} unoptimized />
                ) : (
                  <div style={{
                      width:'100%', height:'100%', 
                      display:'flex', alignItems:'center', justifyContent:'center', 
                      fontSize:'10px', color: 'var(--text-muted)'
                  }}>
                      {comment.author?.name?.[0]}
                  </div>
                )}
              </div>
              
              {/* Isi & Info Komentar */}
              <div style={{flexGrow: 1}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  
                  {/* Nama & Tanggal */}
                  <div style={{display: 'flex', gap: '5px', alignItems: 'center'}}>
                    <Link href={`/user/${comment.author?.username}`} style={{
                        fontSize: '12px', fontWeight: 'bold', 
                        color: 'var(--text-main)', 
                        textDecoration:'none'
                    }}>
                      {comment.author?.name || 'User'}
                    </Link>
                    <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* TOMBOL HAPUS (Hanya muncul jika isMyComment TRUE) */}
                  {isMyComment && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ff4444', // Merah
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: '0 5px',
                        fontWeight: 'bold'
                      }}
                      title="Hapus komentar"
                    >
                      Hapus ✕
                    </button>
                  )}
                </div>

                <p style={{
                    fontSize: '13px', 
                    color: 'var(--text-main)', 
                    margin: '2px 0 0 0', lineHeight: '1.4'
                }}>
                  {comment.content}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* FORM INPUT */}
      {currentUserId && (
        <form onSubmit={handleComment} style={{display: 'flex', gap: '10px'}}>
          <input 
            type="text" 
            placeholder="Tulis balasan..." 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            style={{
              flexGrow: 1, 
              background: 'var(--input-bg)',       
              color: 'var(--text-main)',           
              border: '1px solid var(--border-color)', 
              padding: '8px 12px', 
              borderRadius: '20px', 
              fontSize: '13px', 
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              background: 'var(--accent)', 
              color: '#000',               
              border: 'none',
              padding: '6px 15px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              cursor: isSubmitting ? 'wait' : 'pointer'
            }}
          >
            {isSubmitting ? '...' : 'Kirim'}
          </button>
        </form>
      )}
      
      <button 
        onClick={() => setIsOpen(false)} 
        style={{
            fontSize:'10px', 
            color: 'var(--text-muted)', 
            background:'none', border:'none', 
            marginTop:'10px', cursor:'pointer'
        }}
      >
        Tutup Komentar ▲
      </button>
    </div>
  )
}