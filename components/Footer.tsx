'use client'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-main)] py-6 md:py-10 mt-auto">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-4 text-[var(--text-muted)] text-xs md:text-sm">
        
        {/* Disclaimer - Teks Lengkap, Rata Tengah */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider mb-3">
            Disclaimer
          </h3>
          <p className="leading-relaxed max-w-2xl mx-auto">
            Platform ini disediakan sebagai <strong className="font-semibold">sarana ilmiah dan kreatif</strong> untuk berbagi karya tulis. 
            Konten yang dipublikasikan adalah tanggung jawab masing-masing penulis. 
            Dilarang keras memuat konten yang mengandung unsur SARA, penghinaan, pornografi, 
            maupun konten ilegal lainnya. Kami berhak menghapus konten yang melanggar ketentuan tanpa pemberitahuan sebelumnya.
          </p>
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-[var(--border-color)] mx-auto my-3"></div>

        {/* Contact Us */}
        <div>
          <p className="font-semibold mb-1">Hubungi Kami:</p>
          <a 
            href="https://wa.me/6285932402797"
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] underline transition-colors font-medium"
          >
            Contact Us
          </a>
        </div>

        {/* Copyright & Credit - Rata Tengah */}
        <div className="pt-4 border-t border-[var(--border-color)] space-y-1">
          <p className="text-[11px] md:text-xs">
            &copy; {currentYear} <strong className="font-bold">CERMATI</strong>. All Rights Reserved.
          </p>
          <p className="text-[10px] md:text-xs opacity-80">
            Fullstack - <strong className="font-bold">Benzzz</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}