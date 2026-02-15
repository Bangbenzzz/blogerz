// app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
    /* Container Utama - Tailwind CSS */
    <div className="flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans items-center justify-center p-8 bg-[image:radial-gradient(circle_at_center,var(--bg-card)_0%,var(--bg-main)_100%)]">
      
      {/* Main Content */}
      <div className="flex flex-col items-center text-center w-full max-w-md">
        
        {/* Warna Biru */}
        <div className="text-[#3B82F6] font-mono text-[11px] tracking-widest mb-4 uppercase">
          // New Recruit
        </div>

        {/* Judul */}
        <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-extrabold leading-[0.9] tracking-[-2px] uppercase m-0">
          INITIALIZE
        </h1>
        <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-extrabold leading-none tracking-[-2px] uppercase m-0 mb-10 text-transparent [-webkit-text-stroke:1px_var(--text-muted)]">
          ACCOUNT.
        </h1>

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-8 w-full">
          
          {/* Input Nama - Focus Border Biru */}
          <div className="w-full border-b border-[var(--border-color)] py-2 transition-colors focus-within:border-[#3B82F6] text-left">
            <label className="block text-xs text-[var(--text-muted)] uppercase mb-2 font-mono tracking-wider">
              Full Name
            </label>
            <input 
              type="text" 
              className="w-full bg-transparent border-none text-[var(--text-main)] text-base outline-none font-mono text-center"
              placeholder="Your Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          {/* Input Email - Focus Border Biru */}
          <div className="w-full border-b border-[var(--border-color)] py-2 transition-colors focus-within:border-[#3B82F6] text-left">
            <label className="block text-xs text-[var(--text-muted)] uppercase mb-2 font-mono tracking-wider">
              Email Address
            </label>
            <input 
              type="email" 
              className="w-full bg-transparent border-none text-[var(--text-main)] text-base outline-none font-mono text-center"
              placeholder="name@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Input Password - Focus Border Biru */}
          <div className="w-full border-b border-[var(--border-color)] py-2 transition-colors focus-within:border-[#3B82F6] text-left">
            <label className="block text-xs text-[var(--text-muted)] uppercase mb-2 font-mono tracking-wider">
              Password
            </label>
            <input 
              type="password" 
              className="w-full bg-transparent border-none text-[var(--text-main)] text-base outline-none font-mono text-center"
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>

          {/* Pesan Error/Sukses - Warna Biru untuk Sukses */}
          {errorMsg && <div className="text-red-500 text-[11px] font-mono -mt-4 text-center">[!] {errorMsg}</div>}
          {successMsg && <div className="text-[#3B82F6] text-[11px] font-mono -mt-4 text-center">{successMsg}</div>}

          {/* Tombol Submit - Warna Biru */}
          <button 
            type="submit" 
            className="bg-[#3B82F6] text-white py-3 px-10 font-bold text-xs uppercase transition-all tracking-widest w-full mt-2 hover:bg-[#2563EB] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        {/* Footer Link - Warna Biru */}
        <div className="mt-10 text-[11px] text-[var(--text-muted)] font-mono">
          Already have an account? <Link href="/login" className="text-[#3B82F6] no-underline font-bold ml-1 hover:underline">Sign In here</Link>
        </div>
      </div>
    </div>
  )
}