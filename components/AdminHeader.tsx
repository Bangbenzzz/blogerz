'use client'

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { searchUsers } from '@/app/actions'
import DynamicLogo from './DynamicLogo'

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
  { label: 'Partners', href: '/admin/partners', icon: '🏆' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // ✅ SUDAH DIPERBAIKI: Tidak ada tanda "!" di sini.
      // Artinya: Jika klik terjadi DI DALAM menu, biarkan saja (jangan ditutup otomatis).
      if (menuRef.current && menuRef.current.contains(event.target as Node)) return
      if (searchRef.current && searchRef.current.contains(event.target as Node)) return
      
      // Jika klik di luar, baru tutup panelnya
      if (activePanel) {
        setActivePanel(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activePanel])

  useLayoutEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      setActivePanel(false)
      setSearchQuery('')
    }
  }, [pathname])

  useEffect(() => {
    if (activePanel === 'search' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activePanel])

  const handleToggleMenu = useCallback(() => {
    setActivePanel(prev => prev === 'menu' ? false : 'menu')
    setSearchQuery('')
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
    const targetPath = user.username 
      ? `/user/${user.username}` 
      : `/user/${user.id}`;
    
    router.push(targetPath)
    handleCloseSearch()
  }, [router, handleCloseSearch])

  const isMenuOpen = activePanel === 'menu'
  const isSearchExpanded = activePanel === 'search'

  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-[var(--bg-main)] border-b border-[var(--border-color)]">
      <div className="flex justify-between items-center py-2 px-4 md:px-[10%]">
        <DynamicLogo />

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden md:flex items-center gap-3">
          <nav className="flex gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6]/10'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#3B82F6] hover:text-[#3B82F6]'
                  }`}
                >
                  {item.icon} {item.label}
                </Link>
              )
            })}
          </nav>

          <NotificationBell initialCount={pendingCount} />

          <button
            onClick={handleOpenSearch}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[#3B82F6] transition-colors rounded-full hover:bg-[var(--bg-card)]"
            title="Cari User"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <ThemeToggle />

          {userEmail && (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {`// ${userEmail}`}
            </span>
          )}

          <form action="/auth/signout" method="post">
            <button 
              type="submit" 
              className="bg-red-500/5 border border-red-500 text-red-500 py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all"
            >
              Exit_
            </button>
          </form>
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="flex md:hidden items-center gap-2">
          <NotificationBell initialCount={pendingCount} />
          
          <button
            onClick={handleOpenSearch}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-main)] active:scale-95 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <div ref={menuRef} className="relative">
            <button
              onClick={handleToggleMenu}
              className="flex items-center gap-2 focus:outline-none group ml-1"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--border-color)] group-hover:border-purple-500 transition-colors">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
              </div>
            </button>

            {/* ✅ DROPDOWN MENU MOBILE ADMIN */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl shadow-2xl z-[1001] overflow-hidden text-left">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
                  <p className="text-sm font-bold text-[var(--text-main)] truncate">
                    Administrator
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {userEmail || 'admin'}
                  </p>
                </div>

                <div className="py-2">
                  {/* Link kembali ke public */}
                  <Link
                    href="/"
                    onClick={() => setActivePanel(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Website Utama
                  </Link>

                  <div className="my-1 border-t border-[var(--border-color)]"></div>

                  {/* Looping Menu Admin */}
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActivePanel(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isActive 
                            ? 'bg-[var(--bg-card)] font-bold text-[var(--text-main)]' 
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Mode Tampilan */}
                  <div 
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-[var(--text-main)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer border-t border-[var(--border-color)] mt-1 pt-3"
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
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 w-full transition-colors text-left"
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
        </div>
      </div>

      {/* --- PANEL PENCARIAN (Berlaku untuk Desktop & Mobile) --- */}
      {isSearchExpanded && (
        <div 
          ref={searchRef} 
          className="fixed md:absolute top-[50px] md:top-full left-0 right-0 md:left-auto md:right-[10%] z-[999] p-4 md:p-0"
        >
          <div className="bg-[var(--bg-main)] border border-[#3B82F6] md:rounded-xl shadow-2xl md:w-80 md:mt-2 md:mr-2">
            <div className="h-[45px] flex items-center px-4 border-b md:border-b-0 md:pb-0 border-[var(--border-color)]">
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
                className="bg-transparent border-none text-[var(--text-main)] text-sm pl-2 w-full h-full outline-none"
                autoFocus
              />
              {isSearching && (
                <div className="w-4 h-4 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mr-2" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseSearch();
                }}
                className="flex items-center justify-center w-6 h-6 text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {searchQuery.trim().length > 0 && (
              <div className="max-h-[300px] overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-card)] transition-colors text-left border-t border-[var(--border-color)]"
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
                  ))
                ) : (
                  !isSearching && (
                    <div className="p-4 text-center border-t border-[var(--border-color)]">
                      <span className="text-sm text-[var(--text-muted)]">
                        User tidak ditemukan
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}