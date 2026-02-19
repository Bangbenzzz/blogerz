import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* Efek Glitch Visual (Tetap Dipertahankan) */}
      <div className="relative">
        <h1 className="text-[120px] md:text-[180px] font-black leading-none text-transparent [-webkit-text-stroke:1px_rgba(59,130,246,0.3)]">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl md:text-6xl font-black text-[var(--text-main)] uppercase tracking-tighter animate-pulse">
            Halaman Tidak <br /> <span className="text-[#3B82F6]">Ditemukan</span>
          </h2>
        </div>
      </div>

      <div className="max-w-md mt-8 space-y-6">
        {/* Kata-kata Diubah Menjadi Baku & Profesional */}
        <p className="text-[var(--text-muted)] font-medium text-sm md:text-base leading-relaxed px-4">
          Mohon maaf, halaman yang Anda tuju saat ini tidak tersedia atau telah dipindahkan. 
          Silakan periksa kembali URL Anda atau gunakan tombol di bawah untuk kembali ke halaman utama.
        </p>

        <div className="pt-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-[#3B82F6] text-white py-3 px-10 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#2563EB] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* Dekorasi Background - Tetap dipertahankan untuk estetika */}
      <div className="fixed bottom-10 left-10 opacity-10 pointer-events-none hidden md:block">
        <pre className="text-[10px] font-mono text-[#3B82F6]">
          {`
          SYSTEM_STATUS: ACTIVE
          ENCRYPTION: SECURE
          LOCATION: UNKNOWN
          `}
        </pre>
      </div>
    </div>
  )
}