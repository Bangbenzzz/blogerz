'use client'

import { useState } from 'react'
import { approvePost, deletePost } from '@/app/actions' // DIUBAH: Import dari pusat
import VerifiedBadge from '@/components/VerifiedBadge'

interface Post {
  id: string
  title: string
  content: string | null
  published: boolean
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
  likes: { id: string }[]
}

export default function AdminPostsClient({ 
  posts, 
  adminId,
  adminProfile 
}: { 
  posts: Post[]
  adminId: string
  adminProfile: any
}) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleApprove = async (postId: string) => {
    if (!confirm('Approve post ini?')) return
    setLoading(postId)
    await approvePost(postId)
    setLoading(null)
    window.location.reload()
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Hapus post ini? Tindakan tidak dapat dibatalkan.')) return
    setLoading(postId)
    await deletePost(postId)
    setLoading(null)
    window.location.reload()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)] font-mono">
        <p>Belum ada postingan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden"
        >
          {/* Post Header */}
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-main)] border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-[var(--text-muted)]">
                    {post.author.name?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-[var(--text-main)]">
                    {post.author.name || 'Unknown'}
                  </span>
                  {post.author.isVerified && <VerifiedBadge size="sm" />}
                  <span className="text-xs text-[var(--text-muted)]">
                    @{post.author.username || 'no-username'}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                    post.published 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-orange-500/20 text-orange-500'
                  }`}>
                    {post.published ? 'PUBLISHED' : 'PENDING'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">
                  {post.title}
                </h3>

                {post.content && (
                  <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap line-clamp-3">
                    {post.content}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)] flex-wrap">
                  <span>📅 {formatDate(post.createdAt)}</span>
                  <span>💬 {post.comments.length} komentar</span>
                  <span>❤️ {post.likes.length} likes</span>
                  
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="text-[var(--accent)] hover:underline font-bold"
                  >
                    {expandedPost === post.id ? 'Tutup ▲' : 'Detail ▼'}
                  </button>
                </div>

                {/* Action Buttons for Pending Posts */}
                {!post.published && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={loading === post.id}
                      className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {loading === post.id ? '...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={loading === post.id}
                      className="px-4 py-1.5 bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      {loading === post.id ? '...' : '✕ Hapus'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedPost === post.id && (
            <div className="border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 p-5">
              {post.content && (
                <div className="mb-5 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Isi Lengkap:</h4>
                  <p className="text-sm text-[var(--text-main)] whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>
              )}

              {/* Comments */}
              {post.comments.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">
                    💬 Komentar ({post.comments.length})
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-3 bg-[var(--bg-card)] rounded-lg">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--bg-main)] border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center">
                          {comment.author.avatarUrl ? (
                            <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-[var(--text-muted)]">
                              {comment.author.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[var(--text-main)]">
                              {comment.author.name || 'Unknown'}
                            </span>
                            {comment.author.isVerified && <VerifiedBadge size="sm" />}
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {formatDate(comment.createdAt)}
                            </span>
                            {comment.author.id === adminId && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-500 px-1.5 py-0.5 rounded font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-main)] mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}