// app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase' 
import styles from '../login/login.module.css' // <-- KITA PINJAM CSS LOGIN!
import Link from 'next/link'
import { syncUserToPrisma } from './actions'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      // 1. Daftarkan akun ke mesin Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: name } // Simpan nama
        }
      })
      
      if (error) throw error

      // 2. Kalau berhasil, sinkronisasi ke database Prisma
      if (data.user) {
        await syncUserToPrisma(data.user.id, email, name)
        
        setSuccessMsg('[ ACCOUNT_CREATED_SUCCESSFULLY. REDIRECTING... ]')
        
        // Tunggu 2 detik biar user baca pesan suksesnya, lalu pindah ke halaman login
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }

    } catch (error: any) {
      setErrorMsg(error.message.toUpperCase())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <div className={styles.welcomeLabel}>// New Recruit</div>
        
        <h1 className={styles.title}>INITIALIZE</h1>
        <h1 className={styles.titleOutline}>ACCOUNT.</h1>

        <form onSubmit={handleRegister} className={styles.form}>
          
          {/* INPUT NAMA */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Full Name</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="Your Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email Address</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="name@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>

          {/* PESAN ERROR ATAU SUKSES */}
          {errorMsg && <div className={styles.error}>[!] {errorMsg}</div>}
          {successMsg && <div style={{color: 'var(--accent)', fontSize: '11px', fontFamily: 'monospace'}}>{successMsg}</div>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footerLink}>
          Already have an account? <Link href="/login">Sign In here</Link>
        </div>
      </main>
    </div>
  )
}