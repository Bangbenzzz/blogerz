'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSiteSettings } from '@/app/actions/settings'

export default function DynamicLogo() {
  const pathname = usePathname()
  
  // Set default awal biar langsung muncul (Ganti ini sesuai logo default kamu)
  const [siteName, setSiteName] = useState('Dia Giz') 
  const [siteLogo, setSiteLogo] = useState('/logo.svg')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSiteSettings()
        if (settings) {
          setSiteName(settings.siteName || 'Dia Giz')
          setSiteLogo(settings.siteLogo || '/logo.svg')
        }
      } catch (error) {
        console.error("Gagal ambil logo:", error)
      }
    }

    fetchSettings()
    // Dipanggil setiap URL berubah agar logo selalu update
  }, [pathname]) 

  return (
    <Link href="/" className="flex items-center gap-2 group">
      {/* Container Logo */}
      <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center overflow-hidden">
        <img 
          src={siteLogo} 
          alt="Logo" 
          // Tambahkan transition-opacity agar kalau berubah gambar lebih halus
          className="w-full h-full object-contain transition-opacity duration-300" 
        />
      </div>
      
      {/* Container Nama */}
      <span className="font-extrabold text-lg md:text-xl">
        <span className="text-[var(--text-main)]">
          {siteName.split(' ')[0]}
        </span>
        
        {siteName.split(' ')[1] && (
          <span className="text-[#3B82F6]"> {siteName.split(' ')[1]}</span>
        )}
      </span>
    </Link>
  )
}