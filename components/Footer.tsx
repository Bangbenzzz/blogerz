'use client'

import Link from 'next/link'
import { 
  FaGithub, 
  FaInstagram, 
  FaWhatsapp, 
  FaLinkedin, 
  FaTiktok 
} from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-main)] py-8 md:py-12 mt-auto">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
        
        {/* Sosmed Icons - Dibuat non-aktif (cursor-default) */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-2">
          {/* GitHub - Non Aktif */}
          <span className="text-[var(--text-muted)] opacity-50 cursor-default">
            <FaGithub size={22} title="GitHub (Pending)" />
          </span>
          
          {/* LinkedIn - Non Aktif */}
          <span className="text-[var(--text-muted)] opacity-50 cursor-default">
            <FaLinkedin size={22} title="LinkedIn (Pending)" />
          </span>

          {/* Instagram - Non Aktif */}
          <span className="text-[var(--text-muted)] opacity-50 cursor-default">
            <FaInstagram size={22} title="Instagram (Pending)" />
          </span>

          {/* TikTok - Non Aktif */}
          <span className="text-[var(--text-muted)] opacity-50 cursor-default">
            <FaTiktok size={20} title="TikTok (Pending)" />
          </span>

          {/* WhatsApp - Tetap Aktif karena sudah ada linknya */}
          <a href="https://wa.me/6285932402797" target="_blank" rel="noopener noreferrer"
             className="text-[var(--text-muted)] hover:text-[#25D366] transition-all duration-300 transform hover:scale-110">
            <FaWhatsapp size={22} title="WhatsApp" />
          </a>
        </div>

        {/* Navigasi Legal */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold uppercase tracking-widest">
          <Link href="/terms" className="text-[var(--text-muted)] hover:text-[#3B82F6] no-underline transition-colors">
            Terms Of Services
          </Link>
          <span className="text-[var(--border-color)]">•</span>
          <Link href="/privacy" className="text-[var(--text-muted)] hover:text-[#3B82F6] no-underline transition-colors">
            Privacy Policy
          </Link>
          <span className="text-[var(--border-color)]">•</span>
          <Link href="/about" className="text-[var(--text-muted)] hover:text-[#3B82F6] no-underline transition-colors">
            About
          </Link>
        </div>

        <div className="w-16 h-px bg-[var(--border-color)] mx-auto"></div>

        {/* Disclaimer Singkat */}
        <p className="text-[10px] md:text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl mx-auto opacity-70">
          Platform ini disediakan sebagai sarana ilmiah dan kreatif. Konten yang dipublikasikan adalah tanggung jawab masing-masing penulis.
        </p>

        {/* Copyright */}
        <div className="pt-2">
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-[0.2em]">
            &copy; {currentYear} CERMATI • Dev - <span className="text-[var(--text-main)] font-bold">Benzzz</span>
          </p>
        </div>
      </div>
    </footer>
  )
}