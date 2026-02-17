'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { searchUsers } from '@/app/actions'

export default function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.length >= 1) {
        setLoading(true)
        try {
          const users = await searchUsers(query)
          setResults(users || [])
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
      }
    }, 500)
    return () => clearTimeout(delaySearch)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setResults([])
        if (isExpanded) {
          setIsExpanded(false)
          setQuery('')
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isExpanded])

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleUserClick = (user: any) => {
    // PERBAIKAN: Jika username ada, push ke profil. Jika tidak, peringati.
    if (user.username) {
      router.push(`/user/${user.username}`)
      setQuery('')
      setResults([])
      setIsExpanded(false)
    } else {
      alert(`User "${user.name}" belum mengatur username.`)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Desktop Search */}
      <div className="hidden md:flex items-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-full h-[36px] w-[220px] px-3 hover:border-[#3B82F6]/50 focus-within:border-[#3B82F6] transition-colors">
        <svg className="text-[var(--text-muted)] flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Cari user..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none text-[var(--text-main)] text-[13px] pl-2 w-full h-full outline-none placeholder:text-[var(--text-muted)]"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin"/>
        )}
      </div>

      {/* Mobile Search Icon */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex md:hidden items-center justify-center w-9 h-9 text-[var(--text-main)] hover:text-[#3B82F6] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      )}

      {/* Mobile Expanded Search */}
      {isExpanded && (
        <div className="fixed top-[10px] left-[10px] right-[10px] z-[999] md:hidden">
          <div className="h-[45px] flex items-center bg-[var(--bg-main)] border border-[#3B82F6] rounded-full px-3 shadow-lg">
            <svg className="text-[var(--text-muted)] flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari user..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none text-[var(--text-main)] text-[14px] pl-2 w-full h-full outline-none"
              autoFocus
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mr-2"/>
            )}
            <button
              onClick={() => {
                setQuery('')
                setIsExpanded(false)
                setResults([])
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Mobile Results */}
          {results.length > 0 && (
            <div className="mt-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden max-h-[300px] overflow-y-auto">
              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-card)] transition-colors text-left border-b border-[var(--border-color)] last:border-b-0"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--text-main)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">@{user.username || 'no-username'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop Results Dropdown */}
      {results.length > 0 && !isExpanded && (
        <div className="hidden md:block absolute top-[45px] right-0 w-[280px] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-xl z-[1001] overflow-hidden max-h-[350px] overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-card)] transition-colors text-left border-b border-[var(--border-color)] last:border-b-0"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-main)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">@{user.username || 'no-username'}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}