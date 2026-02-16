'use client'

import { useState } from 'react'
import { approvePost, deletePost } from '@/app/actions'
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
  
  // State untuk Modal Konfirmasi
  const [modal, setModal] = useState<{ 
    type: 'approve' | 'delete' | null, 
    postId: string | null 
  }>({ type: null, postId: null })

  const openModal = (type: 'approve' | 'delete', postId: string) => {
    setModal({ type, postId })
  }

  const closeModal = () => {
    setModal({ type: null, postId: null })
  }

  const handleApprove = async () => {
    if (!modal.postId) return
    setLoading(modal.postId)
    closeModal()
    await approvePost(modal.postId)
    setLoading(null)
    window.location.reload()
  }

  const handleDelete = async () => {
    if (!modal.postId) return
    setLoading(modal.postId)
    closeModal()
    await deletePost(modal.postId)
    setLoading(null)
    window.location.reload()
  }

  const formatDate = (date: Date) => {
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)] font-mono">
        <p>Belum ada postingan.</p>
      </div>
    )
  }

  return (
    <>
      {/* ===== MODAL KONFIRMASI CUSTOM ===== */}
      {modal.type && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div 
            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Icon */}
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full border mb-4 ${
                modal.type === 'delete' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                {modal.type === 'delete' ? (
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">
                {modal.type === 'delete' ? 'Hapus Postingan?' : 'Approve Post Ini?'}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                {modal.type === 'delete' 
                  ? 'Tindakan ini tidak dapat dibatalkan. Data postingan akan hilang permanen.' 
                  : 'Postingan ini akan dipublikasikan dan dapat dilihat semua pengguna.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={modal.type === 'delete' ? handleDelete : handleApprove}
                disabled={loading === modal.postId}
                className={`flex-1 py-2.5 text-white rounded-lg text-sm font-bold transition-colors ${
                  modal.type === 'delete' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {loading === modal.postId ? 'Memproses...' : (modal.type === 'delete' ? 'Ya, Hapus' : 'Ya, Approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LIST POSTINGAN ===== */}
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

                  {/* Preview Konten (Line Clamp) */}
                  {post.content && (
                    <div 
                      className="text-sm text-[var(--text-muted)] line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.content }} 
                    />
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)] flex-wrap">
                    <span>📅 {formatDate(post.createdAt)}</span>
                    <span>💬 {post.comments.length} komentar</span>
                    <span>❤️ {post.likes.length} likes</span>
                    
                    <button
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="text-[#3B82F6] hover:underline font-bold"
                    >
                      {expandedPost === post.id ? 'Tutup ▲' : 'Detail ▼'}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    {!post.published && (
                      <button
                        onClick={() => openModal('approve', post.id)}
                        disabled={loading === post.id}
                        className="px-4 py-1.5 bg-green-500/10 border border-green-500 text-green-500 text-xs font-bold rounded-lg hover:bg-green-500 hover:text-white disabled:opacity-50 transition-colors"
                      >
                        ✓ Approve
                      </button>
                    )}

                    <button
                      onClick={() => openModal('delete', post.id)}
                      disabled={loading === post.id}
                      className="px-4 py-1.5 bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors"
                    >
                      ✕ Hapus
                    </button>
                  </div>

                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedPost === post.id && (
              <div className="border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 p-5">
                {post.content && (
                  <div className="mb-5 p-4 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Isi Lengkap:</h4>
                    {/* 
                      PERBAIKAN HTML DI SINI:
                      Menggunakan dangerouslySetInnerHTML agar tag <p>, <img> terender benar.
                      Ditambah styling Tailwind: 
                      - prose: membuat teks rapi
                      - max-w-full: lebar penuh
                      - break-words: memecah kata panjang
                    */}
                    <div 
                      className="prose prose-sm max-w-full text-[var(--text-main)] leading-relaxed break-words
                                 [&>p]:mb-4 [&>p]:text-sm 
                                 [&>img]:max-w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:mx-auto"
                      dangerouslySetInnerHTML={{ __html: post.content }} 
                    />
                  </div>
                )}

                {/* Comments Section */}
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
                                <span className="text-[9px] bg-[#3B82F6]/20 text-[#3B82F6] px-1.5 py-0.5 rounded font-bold">
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
    </>
  )
}