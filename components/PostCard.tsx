'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleLike, postComment, deleteComment } from '@/app/actions'
import VerifiedBadge from './VerifiedBadge'

interface Post {
  id: string
  title: string
  content: string | null
  createdAt: Date
  author: {
    id: string
    name: string | null
    username: string | null
    avatarUrl: string | null
    isVerified: boolean
  }
  comments: {
    id: string
    content: string
    createdAt: Date
    author: {
      id: string
      name: string | null
      username: string | null
      avatarUrl: string | null
      isVerified: boolean
    }
  }[]
  likes: { id: string; authorId: string }[]
}

interface PostCardProps {
  post: Post
  currentUserId?: string | null
  userEmail?: string | null
}

export default function PostCard({ post, currentUserId, userEmail }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like.authorId === currentUserId))
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [showFull, setShowFull] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(post.comments)
  const [loading, setLoading] = useState(false)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null)

  const isAdmin = userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleLike = async () => {
    if (loading || !currentUserId) return
    setLoading(true)
    
    const result = await toggleLike(post.id)
    if (result.success) {
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    }
    setLoading(false)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || loading) return
    
    setLoading(true)
    const result = await postComment(post.id, commentText)
    if (result.success && result.comment) {
      setComments([...comments, result.comment as any])
      setCommentText('')
    }
    setLoading(false)
  }

  const openDeleteModal = (commentId: string) => {
    setSelectedCommentId(commentId)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedCommentId(null)
  }

  const confirmDelete = async () => {
    if (!selectedCommentId) return
    
    try {
      const result = await deleteComment(selectedCommentId)
      if (result.success) {
        setComments(comments.filter(c => c.id !== selectedCommentId))
        closeDeleteModal()
      } else {
        alert(result.error || 'Gagal menghapus')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // PERBAIKAN HYDRATION: Logika tanggal manual UTC
  const formatDate = (date: Date) => {
    const now = new Date()
    const postDate = new Date(date)
    const diff = now.getTime() - postDate.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes}m lalu`
    if (hours < 24) return `${hours}j lalu`
    if (days < 7) return `${days}h lalu`
    
    // Gunakan UTC untuk tanggal absolut
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${postDate.getUTCDate()} ${months[postDate.getUTCMonth()]}`
  }

  return (
    <>
      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-main)] border border-red-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Hapus Komentar?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Tindakan ini tidak dapat dibatalkan. Komentar akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button 
                onClick={closeDeleteModal}
                className="flex-1 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KARTU POST - Hover Border Biru */}
      <article className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden transition-all hover:border-[#3B82F6]/30">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.author.username || post.author.id}`}>
              {/* Hover Border Biru */}
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[var(--border-color)] hover:border-[#3B82F6] transition-colors">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {post.author.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link 
                  href={`/user/${post.author.username || post.author.id}`}
                  // Hover Text Biru
                  className="font-bold text-[var(--text-main)] hover:text-[#3B82F6] transition-colors text-sm md:text-base"
                >
                  {post.author.name || 'Anonymous'}
                </Link>
                {post.author.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                @{post.author.username || 'user'} • {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5">
          <h2 className="text-lg md:text-xl font-bold text-[var(--text-main)] mb-2">
            {post.title}
          </h2>
          
          {post.content && (
            <p className={`text-sm md:text-base text-[var(--text-muted)] whitespace-pre-wrap leading-relaxed ${!showFull ? 'line-clamp-3' : ''}`}>
              {post.content}
            </p>
          )}
        </div>

        {/* Expanded Section */}
        {showFull && (
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 p-4 md:p-5 space-y-5 animate-in slide-in-from-top-2 duration-300">
            
            {/* Komentar Section */}
            <div className="border-t border-[var(--border-color)] pt-4 mt-4">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Komentar ({comments.length})
              </h4>

              {/* List Komentar */}
              {comments.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {comments.map((comment) => {
                    const isOwner = comment.author.id === currentUserId;
                    const canDelete = isOwner || isAdmin;

                    return (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-[var(--border-color)] flex-shrink-0">
                          {comment.author.avatarUrl ? (
                            <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center">
                              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                                {comment.author.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 bg-[var(--bg-card)] rounded-lg p-2">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[var(--text-main)]">
                                {comment.author.name || 'Anonymous'}
                              </span>
                              {comment.author.isVerified && <VerifiedBadge size="sm" />}
                              <span className="text-[10px] text-[var(--text-muted)]">• {formatDate(comment.createdAt)}</span>
                            </div>
                            
                            {/* TOMBOL HAPUS */}
                            {canDelete && (
                              <button 
                                onClick={() => openDeleteModal(comment.id)}
                                className="text-red-500 hover:text-red-400 transition-colors p-1 rounded"
                                title="Hapus komentar"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic text-center py-4">Belum ada komentar.</p>
              )}

              {/* Form Komentar */}
              <form onSubmit={handleComment} className="flex gap-2 mt-4">
                 <input
                  type="text"
                  placeholder="Tulis komentar..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  // Focus Border Biru
                  className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full px-4 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[#3B82F6] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || loading}
                  // Tombol Kirim Biru
                  className="px-4 py-2 bg-[#3B82F6] text-white text-xs font-bold rounded-full hover:bg-[#2563EB] disabled:opacity-50 transition-all"
                >
                  Kirim
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="px-4 md:px-5 py-3 border-t border-[var(--border-color)] flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={loading || !currentUserId}
            className={`flex items-center gap-2 text-sm transition-all ${
              isLiked 
                ? 'text-red-500' 
                : 'text-[var(--text-muted)] hover:text-red-500'
            }`}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="font-medium">{likeCount}</span>
          </button>

          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="font-medium">{comments.length}</span>
          </div>

          <button 
            onClick={() => setShowFull(!showFull)}
            // Teks Biru
            className="ml-auto text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1"
          >
            {showFull ? (
               <>
                Tutup 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </>
            ) : (
              <>
                Baca 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </>
            )}
          </button>
        </div>
      </article>
    </>
  )
}