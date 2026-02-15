'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface PendingPost {
  id: string
  title: string
  createdAt: Date
  author: {
    name: string | null
    username: string | null
    avatarUrl: string | null
  }
}

interface NotificationBellProps {
  initialCount?: number
  initialPosts?: PendingPost[]
}

export function NotificationBell({ initialCount = 0, initialPosts = [] }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(initialCount)
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>(initialPosts)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch pending posts periodically
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await fetch('/api/admin/pending-posts')
        const data = await response.json()
        setPendingCount(data.count || 0)
        setPendingPosts(data.posts || [])
      } catch (error) {
        console.error('Failed to fetch pending posts:', error)
      }
    }

    if (initialCount === 0 && initialPosts.length === 0) {
      fetchPending()
    }

    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [initialCount, initialPosts])

  // PERBAIKAN HYDRATION: Format tanggal manual UTC
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const day = d.getUTCDate()
    const month = months[d.getUTCMonth()]
    const hour = d.getUTCHours().toString().padStart(2, '0')
    const minute = d.getUTCMinutes().toString().padStart(2, '0')
    return `${day} ${month}, ${hour}:${minute}`
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        title="Notifikasi"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-2xl z-[1000] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
            <span className="text-sm font-bold text-[var(--text-main)]">
              Karya Pending
            </span>
            {pendingCount > 0 && (
              <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full font-bold">
                {pendingCount} menunggu
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[300px] overflow-y-auto">
            {pendingPosts.length > 0 ? (
              pendingPosts.map((post) => (
                <Link
                  key={post.id}
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 p-3 hover:bg-[var(--bg-card)] transition-colors border-b border-[var(--border-color)] last:border-b-0"
                >
                  {/* Avatar Author - Diperbesar agar jelas */}
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                    {post.author.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[var(--text-muted)]">
                        {post.author.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* BAGIAN YANG DITAMBAHKAN: Tampilan Author */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                       <span className="text-xs font-bold text-[#3B82F6] truncate">
                         {post.author.name || 'Unknown'}
                       </span>
                       <span className="text-[10px] text-[var(--text-muted)]">mengajukan karya</span>
                    </div>
                    
                    <p className="text-sm font-semibold text-[var(--text-main)] truncate mb-1">
                      {post.title}
                    </p>
                    
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                  
                  {/* Status */}
                  <span className="text-[9px] bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded font-bold flex-shrink-0 mt-1">
                    PENDING
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center">
                <div className="text-[var(--text-muted)] mb-2">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-50">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  Tidak ada karya pending
                </p>
              </div>
            )}
          </div>

          {/* Footer - Warna Biru */}
          {pendingCount > 0 && (
            <div className="border-t border-[var(--border-color)] p-2 bg-[var(--bg-card)]">
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 text-sm font-bold text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-lg transition-colors"
              >
                Lihat Semua →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}