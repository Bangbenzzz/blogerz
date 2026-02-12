'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import styles from '@/app/dashboard/dashboard.module.css' 
import { ThemeToggle } from './ThemeToggle'

interface UserMenuProps {
  userEmail: string | undefined
  avatarUrl?: string | null
}

export default function UserMenu({ userEmail, avatarUrl }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login') 
    router.refresh()
  }

  return (
    <div className={styles.userMenuContainer}>
      
      {/* TRIGGER KLIK (Avatar + Nama) */}
      <div 
        className={styles.userMenuTrigger} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* 1. AVATAR (Selalu Muncul di Desktop & HP) */}
        <div className={styles.avatarWrapperSmall}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarPlaceholderSmall}>
              {userEmail?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* 2. NAMA/EMAIL (Hanya muncul di Desktop, Hilang di HP) */}
        {/* Perhatikan: Class ini akan di-hide lewat CSS di layar kecil */}
        <div className={styles.userInfoDesktop}>
          <span className={styles.userEmailText}>
            {userEmail?.split('@')[0]}
          </span>
          <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: '4px' }}>▼</span>
        </div>

      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
            onClick={() => setIsOpen(false)}
          />

          <div className={styles.dropdownMenu}>
            {/* Info Email (Muncul di dalam menu dropdown) */}
            <div className={styles.dropdownHeaderInfo}>
              {userEmail}
            </div>

            <Link 
              href="/dashboard" 
              className={styles.dropdownItem}
              onClick={() => setIsOpen(false)}
            >
              👤 Profile & Karya
            </Link>

            <div className={styles.dropdownItem}>
               <div style={{ flex: 1 }}>Tema</div>
               <ThemeToggle />
            </div>
            
            <div 
              className={`${styles.dropdownItem} ${styles.logoutBtn}`}
              onClick={handleLogout}
            >
              Log Out
            </div>
          </div>
        </>
      )}
    </div>
  )
}