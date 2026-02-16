'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminComment } from '../users/actions' // Sesuaikan path jika berbeda
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

export default function AdminDashboardClient({ 
  posts, 
  adminId,
  adminProfile 
}: { 
  posts: Post[]
  adminId: string
  adminProfile: any
}) {
  const router = useRouter()
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return
    
    setLoading(postId)
    await adminComment(postId, commentText)
    
    setCommentText('')
    setLoading(null)
    router.refresh()
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
    <div className="space-y-4">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#3B82F6]/30"
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

                {/* --- PERBAIKAN HTML DI SINI --- */}
                {post.content && (
                  <div 
                    className="text-sm text-[var(--text-muted)] line-clamp-3 mb-2"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)] flex-wrap">
                  <span>📅 {formatDate(post.createdAt)}</span>
                  <span>💬 {post.comments.length} komentar</span>
                  <span>❤️ {post.likes.length} likes</span>
                  
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="text-[#3B82F6] hover:underline font-bold flex items-center gap-1 group"
                  >
                    {expandedPost === post.id ? (
                      <>
                        Tutup 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-y-0.5">
                          <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                      </>
                    ) : (
                      <>
                        Baca & Komentar 
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-0.5">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedPost === post.id && (
            <div className="border-t border-[var(--border-color)] bg-[var(--bg-main)]/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              
              <div className="p-6 space-y-6">
                
                {/* Bagian Konten Penuh */}
                {post.content && (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></div>
                        <h4 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Isi Lengkap Postingan
                        </h4>
                      </div>
                      
                      {/* --- PERBAIKAN HTML FULL CONTENT --- */}
                      <div 
                        className="text-sm text-[var(--text-main)] leading-relaxed break-words
                                   [&>p]:mb-4 [&>p]:text-sm 
                                   [&>img]:max-w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:mx-auto"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </div>
                  </div>
                )}

                {/* Bagian Komentar */}
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6]">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wide">
                        Komentar ({post.comments.length})
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 max-h-[350px] overflow-y-auto">
                    {post.comments.length > 0 ? (
                      <div className="space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 p-3 rounded-lg hover:bg-[var(--bg-main)]/50 transition-colors group relative">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-[#3B82F6]/20 transition-colors rounded-full"></div>
                            
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--bg-main)] border border-[var(--border-color)] flex-shrink-0 flex items-center justify-center shadow-sm">
                              {comment.author.avatarUrl ? (
                                <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-[var(--text-muted)]">
                                  {comment.author.name?.[0]?.toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-sm font-bold text-[var(--text-main)]">
                                  {comment.author.name || 'Unknown'}
                                </span>
                                {comment.author.isVerified && <VerifiedBadge size="sm" />}
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  • {formatDate(comment.createdAt)}
                                </span>
                                {comment.author.id === adminId && (
                                  <span className="text-[9px] bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded-full font-bold border border-[#3B82F6]/30">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[var(--text-main)] leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--bg-main)] border border-dashed border-[var(--border-color)] mb-3">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">Belum ada komentar.</p>
                        <p className="text-xs text-[var(--text-muted)] opacity-70 mt-1">Jadilah yang pertama!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Komentar Admin */}
                <div className="bg-gradient-to-r from-[#3B82F6]/5 to-blue-500/5 border border-[#3B82F6]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6]">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                      <path d="M2 2l7.586 7.586"></path>
                      <circle cx="11" cy="11" r="2"></circle>
                    </svg>
                    <h4 className="text-xs font-bold text-[#3B82F6] uppercase tracking-wide">
                      Komentar sebagai Admin
                    </h4>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex-shrink-0 flex items-center justify-center shadow-inner">
                      {adminProfile?.avatarUrl ? (
                        <img src={adminProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-[#3B82F6]">A</span>
                      )}
                    </div>
                    <div className="flex-grow flex gap-2">
                      <input
                        type="text"
                        placeholder="Tulis komentar atau peringatan..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-grow bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all placeholder:text-[var(--text-muted)]"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!commentText.trim() || loading === post.id}
                        className="px-6 py-2.5 bg-[#3B82F6] text-white text-sm font-bold rounded-lg hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#3B82F6]/20 hover:shadow-[#3B82F6]/40 flex items-center gap-2"
                      >
                        {loading === post.id ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            Kirim
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}