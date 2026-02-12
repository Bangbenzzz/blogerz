// components/OnboardingModal.tsx
'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'

export default function OnboardingModal({ profile }: { profile: any }) {
  // 1. SEMUA HOOKS WAJIB DI TARUH DI PALING ATAS
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // 2. LOGIKA HANDLER
  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setErrorMsg('') 

    const result = await completeOnboarding(formData)

    if (result?.error) {
      setErrorMsg(result.error) 
      setLoading(false)
    } else {
      // Sukses! Segarkan data agar modal hilang
      router.refresh()
      // Tidak perlu setLoading(false) karena modal akan hilang/unmount
    }
  }

  // 3. KONDISI RENDER
  // Jika username sudah ada, jangan tampilkan modal apapun
  if (profile?.username && profile?.username !== '') {
    return null
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)', // Background sedikit lebih transparan biar elegan
      zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', // Blur lebih kuat
      padding: '20px' // Padding container biar gak mentok di HP kecil
    }}>
      
      <div style={{
        background: '#0a0a0a', 
        border: '1px solid #333', // Border lebih halus, jangan terlalu mencolok
        padding: '30px',          // Padding dalam diperkecil dikit
        borderRadius: '16px',     // Radius lebih modern
        width: '100%', 
        maxWidth: '400px',        // UKURAN DIPERKECIL (Lebih ramping)
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* HEADER MODAL */}
        <div style={{textAlign: 'center'}}>
            <h2 style={{
                margin: '0 0 10px 0', 
                color: '#fff', 
                fontSize: '20px', // Font judul diperkecil biar proporsional
                fontWeight: '800'
            }}>
                Selamat Datang!
            </h2>
            <p style={{
                color: '#888', 
                margin: 0, 
                fontSize: '13px', // Font deskripsi diperkecil
                lineHeight: '1.5'
            }}>
                Lengkapi identitas unik kamu agar teman-teman bisa menemukanmu dengan mudah.
            </p>
        </div>

        {/* ALERT ERROR STYLE */}
        {errorMsg && (
          <div style={{
            background: 'rgba(255, 68, 68, 0.1)', 
            border: '1px solid #ff4444',
            color: '#ff4444', 
            padding: '10px 15px', 
            borderRadius: '8px',
            fontSize: '12px', 
            textAlign: 'center',
            fontWeight: '600'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form action={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          
          {/* INPUT NAMA */}
          <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
            <label style={{fontSize:'12px', fontWeight:'700', color:'#aaa', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                Nama Tampilan
            </label>
            <input 
              name="name" 
              type="text" 
              placeholder="Nama Kamu"
              defaultValue={profile?.name || ''}
              required
              style={{
                background: '#16181c', 
                border: '1px solid #333', 
                color: '#fff',
                padding: '12px', 
                borderRadius: '8px', 
                outline: 'none',
                fontSize: '14px',
                transition: '0.2s'
              }}
              // Efek fokus manual lewat onFocus (opsional, tapi bagus)
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          {/* INPUT USERNAME */}
          <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
            <label style={{fontSize:'12px', fontWeight:'700', color:'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                Username (@)
            </label>
            <div style={{position: 'relative'}}>
                <span style={{
                    position: 'absolute', left: '12px', top: '12px', 
                    color: '#888', fontSize: '14px', fontWeight: 'bold'
                }}>@</span>
                <input 
                  name="username" 
                  type="text" 
                  placeholder="username_unik" 
                  required
                  style={{
                    background: '#16181c', 
                    border: '1px solid var(--accent)', // Highlight border username
                    color: '#fff',
                    padding: '12px 12px 12px 30px', // Padding kiri buat simbol @
                    borderRadius: '8px', 
                    outline: 'none', 
                    fontWeight: 'bold',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
            </div>
            <span style={{fontSize:'11px', color:'#555', marginTop: '2px'}}>
                *Permanen & unik (tidak bisa diganti nanti).
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: 'var(--text-main)', // Pakai warna teks utama (biasanya putih/hitam kontras)
              color: 'var(--bg-main)',        // Teks tombol kontras background
              border: 'none',
              padding: '12px', 
              borderRadius: '999px', // Tombol bulat ala Twitter
              fontWeight: '800',
              fontSize: '14px',
              cursor: loading ? 'wait' : 'pointer',
              marginTop: '10px', 
              opacity: loading ? 0.7 : 1,
              transition: '0.2s'
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
          </button>

        </form>
      </div>
    </div>
  )
}