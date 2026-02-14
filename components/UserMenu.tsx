'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

interface UserMenuProps {
  userEmail?: string | null
  avatarUrl?: string | null
  username?: string | null
  name?: string | null
}

export default function UserMenu({ userEmail, avatarUrl, username, name }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = name || 'User'
  const displayHandle = username ? `@${username}` : userEmail || 'user'

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none group"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-[var(--accent)] transition-colors">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--accent)] to-green-700 flex items-center justify-center">
              <span className="text-sm font-bold text-black">
                {displayName?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5"
          className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-2xl z-[1001] overflow-hidden">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
            <p className="text-sm font-bold text-[var(--text-main)] truncate">
              {displayName}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {displayHandle}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* UBAH: Dari /settings menjadi /dashboard */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profil Saya
            </Link>
            
            <Link
              href="/create"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Buat Karya
            </Link>

            <Link
              href="/my-posts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Karya Saya
            </Link>

            {/* Mode Tampilan */}
            <div 
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Mode Tampilan</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-[var(--border-color)] py-2">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 w-full transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Keluar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}