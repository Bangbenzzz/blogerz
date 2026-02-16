'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toggleLike, postComment, deleteComment } from '@/app/actions'
import VerifiedBadge from '@/components/VerifiedBadge'

interface Post {
  id: string
  title: string
  content: string | null
  createdAt: Date
  author: { id: string; name: string | null; username: string | null; avatarUrl: string | null; isVerified: boolean }
  comments: { id: string; content: string; createdAt: Date; author: { id: string; name: string | null; username: string | null; avatarUrl: string | null; isVerified: boolean } }[]
  likes: { id: string; authorId: string }[]
}

interface Props {
  post: Post
  currentUserId: string
  currentProfile: any
  userEmail?: string | null
}

export default function PostDetailClient({ post, currentUserId, currentProfile, userEmail }: Props) {
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like.authorId === currentUserId))
  const [likeCount, setLikeCount] = useState(post.likes.length)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(post.comments || [])
  const [loading, setLoading] = useState(false)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null)

  const isAdmin = userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleLike = async () => {
    if (loading) return
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

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }

  return (
    <>
      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-main)] border border-red-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Hapus Komentar?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors">Batal</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <main className="px-4 md:px-[5%] py-6 md:py-10">
        <article className="max-w-3xl mx-auto">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6">
            <Link href={`/user/${post.author.username || post.author.id}`}>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-[var(--border-color)] hover:border-[#3B82F6] transition-colors">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{post.author.name?.[0]?.toUpperCase() || '?'}</span>
                  </div>
                )}
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <Link href={`/user/${post.author.username || post.author.id}`} className="font-bold text-[var(--text-main)] hover:text-[#3B82F6] transition-colors">
                  {post.author.name || 'Anonymous'}
                </Link>
                {post.author.isVerified && <VerifiedBadge size="sm" />}
              </div>
              <p className="text-sm text-[var(--text-muted)]">@{post.author.username || 'user'} • {formatDate(post.createdAt)}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-[var(--text-main)] mb-6 leading-tight">
            {post.title}
          </h1>
          
          {/* CONTENT - RENDER HTML */}
          <div 
            className="post-content mb-8"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* STYLE UNTUK KONTEN */}
          <style jsx global>{`
            .post-content {
              color: var(--text-muted);
              line-height: 1.8;
              font-size: 1rem;
            }
            
            @media (min-width: 768px) {
              .post-content { font-size: 1.125rem; }
            }
            
            .post-content p { margin-bottom: 1rem; }
            .post-content h1 { font-size: 2rem; font-weight: 800; color: var(--text-main); margin-top: 2rem; margin-bottom: 1rem; }
            .post-content h2 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-top: 1.75rem; margin-bottom: 0.75rem; }
            .post-content h3 { font-size: 1.25rem; font-weight: 600; color: var(--text-main); margin-top: 1.5rem; margin-bottom: 0.5rem; }
            
            /* CSS UNTUK GAMBAR */
            .post-content img {
              max-width: 100%;
              height: auto;
              border-radius: 0.5rem;
              margin: 1.5rem auto;
              display: block;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .post-content a { color: #3B82F6; text-decoration: underline; }
            .post-content a:hover { color: #2563EB; }
            .post-content strong { color: var(--text-main); font-weight: 600; }
            
            .post-content blockquote {
              border-left: 4px solid #3B82F6;
              padding-left: 1rem;
              margin: 1.5rem 0;
              font-style: italic;
              color: var(--text-muted);
              background: var(--bg-card);
              padding: 1rem;
              border-radius: 0 0.5rem 0.5rem 0;
            }
            
            .post-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
            .post-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1rem 0; }
            .post-content li { margin-bottom: 0.5rem; }
            
            .post-content code {
              background: var(--bg-card);
              color: #EC4899;
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              font-size: 0.875em;
            }
            
            .post-content pre {
              background: var(--bg-card);
              border: 1px solid var(--border-color);
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1.5rem 0;
            }
            
            .post-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
            .post-content th { background: var(--bg-card); font-weight: 600; padding: 0.75rem; text-align: left; border: 1px solid var(--border-color); }
            .post-content td { padding: 0.75rem; border: 1px solid var(--border-color); }
          `}</style>

          {/* Actions */}
          <div className="flex items-center gap-4 py-4 border-y border-[var(--border-color)] mb-8">
            <button onClick={handleLike} disabled={loading} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLiked ? 'bg-red-500/10 text-red-500' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-red-500'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span className="font-bold">{likeCount}</span>
            </button>
            <span className="text-sm text-[var(--text-muted)]">{comments.length} komentar</span>
          </div>

          {/* Comment Form */}
          <div className="mb-8">
            <form onSubmit={handleComment} className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border-color)] flex-shrink-0">
                {currentProfile?.avatarUrl ? (
                  <img src={currentProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#3B82F6] to-blue-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{currentProfile?.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <input type="text" placeholder="Tulis komentar..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[#3B82F6] transition-colors" />
                <button type="submit" disabled={!commentText.trim() || loading} className="px-5 py-2 bg-[#3B82F6] text-white text-sm font-bold rounded-full hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all">Kirim</button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-4">
              {comments.map((comment) => {
                const isOwner = comment.author.id === currentUserId;
                const canDelete = isOwner || isAdmin;
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Link href={`/user/${comment.author.username || comment.author.id}`}>
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-[var(--border-color)] flex-shrink-0">
                        {comment.author.avatarUrl ? (
                          <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{comment.author.name?.[0]?.toUpperCase() || '?'}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link href={`/user/${comment.author.username || comment.author.id}`} className="text-sm font-bold text-[var(--text-main)] hover:text-[#3B82F6] transition-colors">
                            {comment.author.name || 'Anonymous'}
                          </Link>
                          {comment.author.isVerified && <VerifiedBadge size="sm" />}
                          <span className="text-xs text-[var(--text-muted)]">• {formatDate(comment.createdAt)}</span>
                        </div>
                        {canDelete && (
                          <button onClick={() => openDeleteModal(comment.id)} className="text-red-500 hover:text-red-400 transition-colors p-1 rounded">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mt-1">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>
      </main>
    </>
  )
}