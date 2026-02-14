'use client'

import { useState } from 'react'
import { adminComment } from './actions'
import VerifiedBadge from '@/components/VerifiedBadge'

interface UserDetailModalProps {
  user: any
  onClose: () => void
}

export default function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commentingPost, setCommentingPost] = useState<string | null>(null)

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return
    
    setCommentingPost(postId)
    await adminComment(postId, commentText)
    
    setCommentText('')
    setCommentingPost(null)
    window.location.reload()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatFullDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[var(--text-main)] m-0">
              👤 User Detail
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(90vh-60px)]">
          
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-[var(--border-color)]">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--bg-card)] border-2 border-[var(--border-color)] flex-shrink-0 flex items-center justify-center mb-4">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover"/>
              ) : (
                <span className="text-4xl font-bold text-[var(--text-muted)]">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            
            {/* Name + Verified */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-[var(--text-main)] m-0">
                {user.name || 'No Name'}
              </h3>
              {user.isVerified && <VerifiedBadge size="lg" />}
            </div>
            
            {/* Username */}
            <p className="text-[var(--accent)] font-mono text-base mb-2">
              @{user.username || 'no-username'}
            </p>
            
            {/* Email */}
            <p className="text-xs text-[var(--text-muted)] mb-3">
              {user.email}
            </p>
            
            {/* Badges */}
            <div className="flex gap-2 flex-wrap justify-center">
              <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                user.role === 'ADMIN' 
                  ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]' 
                  : 'bg-blue-500/20 text-blue-500 border border-blue-500'
              }`}>
                {user.role}
              </span>
              <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                user.isBanned 
                  ? 'bg-red-500/20 text-red-500 border border-red-500' 
                  : 'bg-green-500/20 text-green-500 border border-green-500'
              }`}>
                {user.isBanned ? 'BANNED' : 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Bio</h4>
              <p className="text-sm text-[var(--text-main)] bg-[var(--bg-card)] p-3 rounded-lg border border-[var(--border-color)]">
                {user.bio}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-[var(--text-main)]">{user._count?.posts || 0}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase">Posts</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-[var(--text-main)]">{user._count?.comments || 0}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase">Comments</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-[var(--text-main)]">{user._count?.likes || 0}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase">Likes</div>
            </div>
          </div>

          {/* Karya User */}
          {user.posts && user.posts.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">
                📝 Karya User ({user._count?.posts || 0})
              </h4>
              <div className="space-y-3">
                {user.posts.slice(0, 5).map((post: any) => (
                  <div key={post.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden">
                    
                    {/* Post Header */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-base font-bold text-[var(--text-main)] mb-1 truncate">{post.title}</h5>
                          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] flex-wrap">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>💬 {post._count?.comments || 0} komentar</span>
                            <span>❤️ {post.likes?.length || 0} likes</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex-shrink-0 ${
                          post.published 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-orange-500/20 text-orange-500'
                        }`}>
                          {post.published ? 'PUBLISHED' : 'PENDING'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedPost === post.id && (
                      <div className="border-t border-[var(--border-color)] p-4 bg-[var(--bg-main)]/50">
                        
                        {/* Isi Konten */}
                        {post.content && (
                          <div className="text-sm text-[var(--text-main)] whitespace-pre-wrap mb-4 leading-relaxed">
                            {post.content}
                          </div>
                        )}

                        {/* Komentar */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                            <h6 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">
                              💬 Komentar ({post.comments.length})
                            </h6>
                            <div className="space-y-3 max-h-[200px] overflow-y-auto">
                              {post.comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-2">
                                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--bg-card)] flex-shrink-0 flex items-center justify-center border border-[var(--border-color)]">
                                    {comment.author?.avatarUrl ? (
                                      <img src={comment.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] text-[var(--text-muted)]">
                                        {comment.author?.name?.[0] || '?'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-[var(--text-main)]">
                                        {comment.author?.name || 'User'}
                                      </span>
                                      {comment.author?.isVerified && <VerifiedBadge size="sm" />}
                                      <span className="text-[10px] text-[var(--text-muted)]">
                                        {formatDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-[var(--text-main)] mt-1 break-words">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Form Komentar Admin */}
                        <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tulis komentar sebagai Admin..."
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="flex-grow bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                            />
                            <button
                              onClick={() => handleComment(post.id)}
                              disabled={!commentText.trim() || commentingPost === post.id}
                              className="px-4 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex-shrink-0"
                            >
                              {commentingPost === post.id ? '...' : 'Kirim'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Joined Date */}
          <div className="pt-4 border-t border-[var(--border-color)] text-center">
            <span className="text-xs text-[var(--text-muted)]">
              Bergabung: {formatFullDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}