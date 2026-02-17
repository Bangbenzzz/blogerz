'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSiteSettings } from '@/app/actions/settings'

export default function DynamicLogo() {
  const [siteName, setSiteName] = useState('CERMATI')
  const [siteLogo, setSiteLogo] = useState('/logo.svg')

  useEffect(() => {
    getSiteSettings().then((settings) => {
      setSiteName(settings.siteName)
      setSiteLogo(settings.siteLogo)
    })
  }, [])

  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center overflow-hidden">
        <img src={siteLogo} alt="Logo" className="w-full h-full object-contain" />
      </div>
      
      <span className="font-extrabold text-lg md:text-xl">
        {/* UBAH INI: text-white -> text-[var(--text-main)] */}
        <span className="text-[var(--text-main)]">{siteName.split(' ')[0]}</span>
        
        {/* Bagian kedua tetap biru (warna aksen) */}
        {siteName.split(' ')[1] && (
          <span className="text-[#3B82F6]"> {siteName.split(' ')[1]}</span>
        )}
      </span>
    </Link>
  )
}