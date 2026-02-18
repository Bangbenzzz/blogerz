import Link from 'next/link'

export default function BannedView() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 text-center z-[99999] relative">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 animate-pulse">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-[var(--text-main)] uppercase mb-2">
        Account Banned
      </h1>

      <p className="text-[var(--text-muted)] max-w-md mb-8 leading-relaxed">
        Akun Anda telah diblokir oleh Administrator karena melanggar aturan komunitas. 
        Anda tidak dapat mengakses halaman apapun.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://wa.me/6285932402797"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 text-white py-3 px-6 font-bold rounded-full hover:bg-green-600 transition-all shadow-lg"
        >
           Hubungi Admin
        </a>

        {/* Form Logout Wajib Ada agar user bisa ganti akun */}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] py-3 px-6 font-bold rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
          >
            Logout / Ganti Akun
          </button>
        </form>
      </div>
    </div>
  )
}