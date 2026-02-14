'use client'

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { searchUsers } from '@/app/actions'

interface NavItem {
  label: string
  href: string
  icon: string
}

interface UserResult {
  id: string
  name: string | null
  username: string | null
  avatarUrl: string | null
}

interface AdminHeaderProps {
  title?: string
  subtitle?: string
  userEmail?: string
  navItems?: NavItem[]
  currentPage?: string
  pendingCount?: number
}

const defaultNavItems: NavItem[] = [
  { label: 'Posts', href: '/admin', icon: '📝' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
]

export function AdminHeader({ 
  title,
  currentPage,
  subtitle,
  userEmail,
  navItems = defaultNavItems,
  pendingCount = 0
}: AdminHeaderProps) {
  const displayTitle = title || currentPage || 'Admin Dashboard'

  const [activePanel, setActivePanel] = useState<'menu' | 'search' | false>(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevPathnameRef = useRef(pathname)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        setIsSearching(true)
        try {
          const users = await searchUsers(searchQuery)
          setSearchResults(users || [])
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (activePanel === 'menu') {
          setActivePanel(false)
        }
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (activePanel === 'search') {
          setActivePanel(false)
          setSearchQuery('')
          setSearchResults([])
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activePanel])

  // Close menu on route change
  useLayoutEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      if (activePanel === 'menu') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActivePanel(false)
      }
    }
  }, [pathname, activePanel])

  // Auto focus on search expand
  useEffect(() => {
    if (activePanel === 'search' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activePanel])

  const handleToggleMenu = useCallback(() => {
    setActivePanel(prev => prev === 'menu' ? false : 'menu')
  }, [])

  const handleOpenSearch = useCallback(() => {
    setActivePanel('search')
  }, [])

  const handleCloseSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setActivePanel(false)
  }, [])

  const handleUserClick = useCallback((user: UserResult) => {
    if (user.username) {
      router.push(`/user/${user.username}`)
      handleCloseSearch()
    } else {
      alert(`User "${user.name}" belum mengatur username.`)
    }
  }, [router, handleCloseSearch])

  const isMenuOpen = activePanel === 'menu'
  const isSearchExpanded = activePanel === 'search'

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-main)] backdrop-blur-xl border-b border-white/10">
      {/* Main Header Row */}
      <div className="flex justify-between items-center py-3 px-4 md:px-[10%]">
        {/* LEFT: Title */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <span className="text-[var(--accent)] font-mono text-[10px] tracking-widest uppercase">
            {`// ADMIN_PANEL`}
          </span>
          <h1 className="text-base md:text-xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
            {displayTitle}
          </h1>
          {subtitle && (
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              {subtitle}
            </span>
          )}
        </div>

        {/* RIGHT: Desktop Nav + Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="flex gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Notification Bell */}
          <NotificationBell initialCount={pendingCount} />

          {/* Theme Toggle - Desktop */}
          <ThemeToggle />

          {/* User Email */}
          {userEmail && (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {`// ${userEmail}`}
            </span>
          )}

          {/* Sign Out */}
          <form action="/auth/signout" method="post">
            <button 
              type="submit" 
              className="bg-red-500/5 border border-red-500 text-red-500 py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all"
            >
              Exit_
            </button>
          </form>
        </div>

        {/* RIGHT: Mobile Actions */}
        <div className="flex md:hidden items-center gap-1">
          {/* Notification Bell - Mobile */}
          <NotificationBell initialCount={pendingCount} />

          {/* Search Icon Button */}
          <button
            onClick={handleOpenSearch}
            className="w-9 h-9 flex items-center justify-center text-[var(--text-main)] active:scale-95 transition-transform"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {/* Toggle Menu Button */}
          <button
            onClick={handleToggleMenu}
            className="w-9 h-9 flex items-center justify-center text-[var(--text-main)] active:scale-95 transition-transform"
          >
            {isMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {isSearchExpanded && (
        <div ref={searchRef} className="md:hidden fixed top-[10px] left-[10px] right-[10px] z-[999]">
          {/* Search Input */}
          <div className="h-[45px] flex items-center bg-[var(--bg-main)] border border-[var(--accent)] rounded-full px-[12px] shadow-lg">
            <div className="text-[var(--text-muted)] flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-[var(--text-main)] text-[14px] pl-2 w-full h-full outline-none"
              autoFocus
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mr-2" />
            )}
            <button
              onClick={handleCloseSearch}
              className="flex items-center justify-center w-6 h-6 text-[var(--text-muted)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden max-h-[300px] overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-card)] transition-colors text-left border-b border-[var(--border-color)] last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--text-muted)]">
                        {user.name?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[var(--text-main)] truncate">
                      {user.name || 'Unknown'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      @{user.username || 'no-username'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery.trim() && !isSearching && searchResults.length === 0 && (
            <div className="mt-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-lg p-4 text-center">
              <span className="text-sm text-[var(--text-muted)]">
                User &quot;{searchQuery}&quot; tidak ditemukan
              </span>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="md:hidden absolute top-full left-0 right-0 bg-[var(--bg-main)] border-b border-[var(--border-color)] shadow-lg"
        >
          <nav className="flex flex-col py-2 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-3 px-3 text-sm font-mono font-bold uppercase tracking-wider border-l-2 transition-all ${
                    isActive
                      ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10'
                      : 'border-transparent text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {userEmail && (
                <span className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[50%]">
                  {userEmail}
                </span>
              )}
            </div>
            <form action="/auth/signout" method="post">
              <button 
                type="submit" 
                className="bg-red-500/10 text-red-500 py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all rounded"
              >
                Exit_
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}