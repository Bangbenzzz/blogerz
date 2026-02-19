import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8 md:p-24 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#3B82F6] text-xs font-mono mb-12 inline-block hover:underline tracking-widest">
          ← BACK TO SYSTEM
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter uppercase border-b border-[var(--border-color)] pb-4">
          Privacy <span className="text-transparent [-webkit-text-stroke:1px_var(--text-main)]">Policy</span>
        </h1>
        
        <div className="space-y-8 text-sm md:text-base text-[var(--text-muted)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-3 uppercase font-mono tracking-tight underline decoration-[#3B82F6] decoration-2 underline-offset-4">
              01. Pengumpulan Data
            </h2>
            <p>Saat Anda menggunakan layanan kami (Login via Google/GitHub), kami mengumpulkan informasi profil publik Anda termasuk nama, alamat email, dan foto profil. Data ini digunakan murni untuk identitas penulis di platform kami.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-3 uppercase font-mono tracking-tight underline decoration-[#3B82F6] decoration-2 underline-offset-4">
              02. Keamanan Akun
            </h2>
            <p>Kami menggunakan enkripsi standar industri untuk melindungi transmisi data Anda. Kami tidak menyimpan password Anda secara langsung jika Anda menggunakan metode login pihak ketiga (OAuth).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-3 uppercase font-mono tracking-tight underline decoration-[#3B82F6] decoration-2 underline-offset-4">
              03. Penggunaan Cookie
            </h2>
            <p>Kami menggunakan cookie untuk menjaga sesi login Anda tetap aktif. Cookie ini membantu sistem mengenali Anda saat kembali ke platform tanpa harus login berulang kali.</p>
          </section>
        </div>
      </div>
    </div>
  )
}