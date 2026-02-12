'use client'

import { useState, useEffect, useRef } from 'react'
import { searchUsers } from '@/app/actions'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
// PASTIKAN path ini benar mengarah ke file CSS Module di atas
import styles from '@/app/dashboard/dashboard.module.css'

export default function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // State untuk mode HP (Kaca pembesar vs Full Input)
  const [isExpanded, setIsExpanded] = useState(false) 
  
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce Search
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.length >= 1) { 
        setLoading(true)
        const users = await searchUsers(query)
        setResults(users)
        setLoading(false)
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
        // Jika query kosong, tutup mode expand
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
    // Class .expanded ditambahkan kondisional
    <div 
      ref={containerRef}
      className={`${styles.searchContainer} ${isExpanded ? styles.expanded : ''}`}
    >
      
      {/* WRAPPER INPUT */}
      <div className={styles.searchInputWrapper} onClick={handleExpand}>
        <span className={styles.searchIcon}>🔍</span>
        
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Cari teman..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
        />

        {/* Tombol Close (X) Khusus HP saat expand */}
        {isExpanded && (
          <span 
            onClick={(e) => {
              e.stopPropagation()
              setQuery('')
              setIsExpanded(false)
              setResults([])
            }}
            style={{
                fontSize:'14px', 
                color:'var(--text-muted)', 
                cursor:'pointer', 
                marginLeft:'10px',
                fontWeight: 'bold'
            }}
          >
            ✕
          </span>
        )}
      </div>

      {/* DROPDOWN HASIL */}
      {(results.length > 0 || loading) && (
        <div className={styles.searchDropdown}>
          {loading && <div style={{padding: '15px', fontSize: '12px', color: 'var(--text-muted)', textAlign:'center'}}>Mencari...</div>}
          
          {results.map((user) => (
            <div 
              key={user.id} 
              onClick={() => handleUserClick(user)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px', cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'var(--bg-card)', overflow: 'hidden', flexShrink: 0,
                border: '1px solid var(--border-color)'
              }}>
                {user.avatarUrl ? (
                   <Image src={user.avatarUrl} alt="av" width={32} height={32} style={{objectFit:'cover'}} unoptimized/>
                ) : (
                  <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'var(--text-muted)'}}>
                    {user.name?.[0]}
                  </div>
                )}
              </div>
              
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