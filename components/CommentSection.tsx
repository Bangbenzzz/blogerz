'use client'

import { useState } from 'react'
import { deleteComment, postComment } from '@/app/actions'
import VerifiedBadge from './VerifiedBadge'

interface Comment {
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
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  currentUserId?: string | null
  isAdmin?: boolean
}

export default function CommentSection({ postId, comments, currentUserId, isAdmin }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('')
  const [commentList, setCommentList] = useState(comments)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || loading) return
    
    setLoading(true)
    const result = await postComment(postId, commentText)
    if (result.success && result.comment) {
      setCommentList([...commentList, result.comment as Comment])
      setCommentText('')
    }
    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return
    
    const result = await deleteComment(commentId)
    if (result.success) {
      setCommentList(commentList.filter(c => c.id !== commentId))
    }
  }

  // PERBAIKAN HYDRATION: Format tanggal manual UTC
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }

  return (
    <div className="space-y-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="Tulis komentar..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          // Focus Border Biru
          className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[#3B82F6] transition-colors"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || loading}
          // Tombol Biru
          className="px-5 py-2 bg-[#3B82F6] text-white text-sm font-bold rounded-full hover:bg-[#2563EB] disabled:opacity-50 transition-all"
        >
          {loading ? '...' : 'Kirim'}
        </button>
      </form>

      {/* Comments List */}
      {commentList.length > 0 && (
        <div className="space-y-3">
          {commentList.map((comment) => (
            <div key={comment.id} className="flex gap-3 p-3 bg-[var(--bg-card)] rounded-xl">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--border-color)] flex-shrink-0">
                {comment.author.avatarUrl ? (
                  <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {comment.author.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-[var(--text-main)]">
                    {comment.author.name || 'Anonymous'}
                  </span>
                  {comment.author.isVerified && <VerifiedBadge size="sm" />}
                  <span className="text-xs text-[var(--text-muted)]">
                    • {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1">{comment.content}</p>
              </div>
              
              {/* Delete Button */}
              {(comment.author.id === currentUserId || isAdmin) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-red-500 hover:text-red-400 transition-colors p-1"
                  title="Hapus komentar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}