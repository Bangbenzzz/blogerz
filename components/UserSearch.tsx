'use client'

import { useState, useEffect, useRef } from 'react'
import { searchUsers } from '@/app/actions'
import { useRouter } from 'next/navigation'
// Gunakan img tag standar agar lebih fleksibel dengan Supabase storage, atau Next Image dengan config
import styles from '@/app/dashboard/dashboard.module.css'

export default function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // State untuk mode HP (Expand vs Icon Only)
  const [isExpanded, setIsExpanded] = useState(false) 
  
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce Search
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.length >= 1) { 
        setLoading(true)
        try {
          const users = await searchUsers(query)
          setResults(users)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
      }
    }, 500) 
    return () => clearTimeout(delaySearch)
  }, [query])

  // Klik di luar -> Tutup Mode Expand (HP) & Reset
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Jika query kosong, tutup mode expand agar balik jadi icon kecil di HP
        if (query === '') {
            setIsExpanded(false)
        }
        setResults([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [query])

  // Fokus otomatis ke input saat expand
  useEffect(() => {
    if (isExpanded && inputRef.current) {
        inputRef.current.focus()
    }
  }, [isExpanded])

  const handleUserClick = (user: any) => {
    if (user.username) {
      router.push(`/user/${user.username}`)
      setQuery('') 
      setResults([])
      setIsExpanded(false)
    } else {
      alert(`User "${user.name}" belum mengatur username.`)
    }
  }

  const handleExpand = () => {
    setIsExpanded(true)
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.searchContainer} ${isExpanded ? styles.expanded : ''}`}
    >
      
      {/* WRAPPER INPUT */}
      <div className={styles.searchInputWrapper} onClick={handleExpand}>
        
        {/* ICON KACA PEMBESAR (SVG MODERN - BUKAN EMOJI) */}
        <div className={styles.searchIcon}>
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Cari teman..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />

        {/* Loading Spinner Kecil (Opsional) */}
        {loading && (
           <div style={{
             width:'12px', height:'12px', 
             border:'2px solid var(--text-muted)', 
             borderTopColor:'transparent', 
             borderRadius:'50%', 
             animation:'spin 1s linear infinite',
             marginRight: '8px',
             marginLeft: 'auto'
           }}/>
        )}

        {/* Tombol Close (X) Khusus HP saat expand */}
        {isExpanded && !loading && (
          <div 
            onClick={(e) => {
              e.stopPropagation()
              setQuery('')
              setIsExpanded(false)
              setResults([])
            }}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                color:'var(--text-muted)', 
                cursor:'pointer', 
                marginLeft:'auto'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        )}
      </div>

      {/* DROPDOWN HASIL */}
      {results.length > 0 && (
        <div className={styles.searchDropdown}>
          {results.map((user) => (
            <div 
              key={user.id} 
              onClick={() => handleUserClick(user)}
              className={styles.searchResultItem}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px', cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* AVATAR */}
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0,
                border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt="av" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                  <span style={{fontSize:'12px', fontWeight:'bold', color:'var(--text-muted)'}}>
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* INFO USER */}
              <div style={{display:'flex', flexDirection:'column'}}>
                <span style={{color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold'}}>
                    {user.name}
                </span>
                <span style={{color: user.username ? 'var(--accent)' : '#ff4444', fontSize: '11px'}}>
                  {user.username ? `@${user.username}` : 'No username'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}