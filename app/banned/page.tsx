import Link from 'next/link'

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 text-center">
      
      {/* Icon Gembok */}
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 animate-pulse">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] uppercase mb-2">
        Account Banned
      </h1>
      
      <p className="text-[var(--text-muted)] max-w-md mb-8 leading-relaxed">
        Akun Anda telah diblokir oleh Administrator karena melanggar aturan komunitas. Jika ini sebuah kesalahan, silakan hubungi Admin.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tombol WhatsApp Admin */}
        <a 
          href="https://wa.me/6285932402797" // GANTI DENGAN NOMOR ADMIN ANDA
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 text-white py-3 px-6 font-bold rounded-full hover:bg-green-600 transition-all shadow-lg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Kontak Admin via WA
        </a>

        {/* Tombol Logout */}
        <form action="/auth/signout" method="post">
          <button 
            type="submit"
            className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] py-3 px-6 font-bold rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </form>
      </div>
    </div>
  )
}