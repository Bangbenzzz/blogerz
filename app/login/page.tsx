'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.user) {
        // 1. Sync Profile
        const res = await fetch('/api/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0]
          })
        })
        
        const syncData = await res.json()
        const userProfile = syncData.profile

        // 2. Logika Redirect
        if (data.user.email === 'admin@bloger.com') { // Ganti dengan process.env jika perlu
          router.push('/admin')
        } else {
          // Prioritaskan username, jika tidak ada pakai ID
          const redirectId = userProfile?.username || userProfile?.id || data.user.id
          router.push(`/user/${redirectId}`)
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message.toUpperCase())
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true); // ⚡ Langsung aktifkan loading agar user tahu proses dimulai
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        // Tambahkan ini agar Google selalu meminta akun (opsional, tapi lebih pasti)
        queryParams: {
          prompt: 'select_account',
        },
      }
    })

    if (error) {
      setLoading(false);
      setErrorMsg(error.message.toUpperCase());
    }
    // Jika sukses, browser akan otomatis pindah halaman, jadi biarkan loading tetap true
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans items-center justify-center p-8 bg-[image:radial-gradient(circle_at_center,var(--bg-card)_0%,var(--bg-main)_100%)]">
      
      <div className="flex flex-col items-center text-center w-full max-w-md">
        
        <div className="text-[#3B82F6] font-mono text-[11px] tracking-widest mb-4 uppercase">
          // Welcome Back
        </div>

        <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-extrabold leading-[0.9] tracking-[-2px] uppercase m-0">
          JOURNAL
        </h1>
        <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-extrabold leading-none tracking-[-2px] uppercase m-0 mb-10 text-transparent [-webkit-text-stroke:1px_var(--text-muted)]">
          MANAGER.
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-8 w-full">
          
          {/* Input Email */}
          <div className="w-full border-b border-[var(--border-color)] py-2 transition-colors focus-within:border-[#3B82F6] text-left">
            <label className="block text-xs text-[var(--text-muted)] uppercase mb-2 font-mono tracking-wider">
              Email Address
            </label>
            <input 
              type="email" 
              className="w-full bg-transparent border-none text-[var(--text-main)] text-base outline-none font-mono text-center"
              placeholder="Masukan Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Input Password */}
          <div className="w-full border-b border-[var(--border-color)] py-2 transition-colors focus-within:border-[#3B82F6] text-left relative">
            <label className="block text-xs text-[var(--text-muted)] uppercase mb-2 font-mono tracking-wider">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent border-none text-[var(--text-main)] text-base outline-none font-mono text-center pr-10"
                placeholder="Masukan Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {errorMsg && <div className="text-red-500 text-[11px] font-mono -mt-4 text-center">[!] {errorMsg}</div>}

          <button 
            type="submit" 
            className="flex items-center justify-center gap-2 bg-[#3B82F6] text-white py-3 px-10 font-bold text-xs uppercase transition-all tracking-widest w-full mt-2 hover:bg-[#2563EB] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="w-full flex items-center my-10">
          <div className="flex-1 h-px bg-[var(--border-color)]"></div>
          <span className="px-4 text-[var(--text-muted)] text-[10px] font-mono tracking-wider">Or Continue With</span>
          <div className="flex-1 h-px bg-[var(--border-color)]"></div>
        </div>

        <div className="flex justify-between items-center gap-4 w-full">
          
          <button 
            onClick={() => handleSocialLogin('google')} 
            className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-[var(--border-color)] text-[var(--text-main)] py-3 text-xs font-bold transition-all font-mono hover:border-[#3B82F6] hover:text-[#3B82F6]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            GOOGLE
          </button>
          
          <button 
            onClick={() => handleSocialLogin('github')} 
            className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-[var(--border-color)] text-[var(--text-main)] py-3 text-xs font-bold transition-all font-mono hover:border-[#3B82F6] hover:text-[#3B82F6]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GITHUB
          </button>
        </div>

        <div className="mt-10 text-[11px] text-[var(--text-muted)] font-mono">
          New here? <Link href="/register" className="text-[#3B82F6] no-underline font-bold ml-1 hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  )
}