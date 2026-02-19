import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] p-8 md:p-24 font-sans leading-relaxed">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#3B82F6] text-xs font-mono mb-12 inline-block hover:underline tracking-widest">
          ← BACK TO SYSTEM
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tighter uppercase border-b border-[var(--border-color)] pb-4">
          Terms of <span className="text-transparent [-webkit-text-stroke:1px_var(--text-main)]">Service</span>
        </h1>
        
        <div className="space-y-8 text-sm md:text-base text-[var(--text-muted)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-3 uppercase font-mono tracking-tight underline decoration-[#3B82F6] decoration-2 underline-offset-4">
              01. Hak Cipta Konten
            </h2>
            <p>Seluruh tulisan dan karya yang dipublikasikan tetap menjadi hak milik penulis. Dengan mengunggah konten, Anda memberikan izin kepada kami untuk menampilkan konten tersebut secara publik di platform ini.</p>
          </section>

          {/* POIN YANG DIPERKETAT */}
          <section className="border-l-2 border-red-500/50 pl-6 py-2 bg-red-500/5">
            <h2 className="text-lg font-bold text-red-500 mb-3 uppercase font-mono tracking-tight">
              02. Aturan Komentar & Moderasi
            </h2>
            <p className="mb-3 italic text-[var(--text-main)]">Kami menjunjung tinggi diskusi yang sehat dan edukatif.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Dilarang keras memberikan komentar yang mengandung hinaan, SARA, atau kata-kata tidak pantas.</li>
              <li>Spamming dan promosi ilegal di kolom komentar akan langsung dihapus.</li>
              <li><strong className="text-[var(--text-main)]">Admin memiliki hak penuh</strong> untuk menghapus komentar atau memblokir akun yang dianggap melanggar etika komunitas tanpa pemberitahuan sebelumnya.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-main)] mb-3 uppercase font-mono tracking-tight underline decoration-[#3B82F6] decoration-2 underline-offset-4">
              03. Pembatasan Tanggung Jawab
            </h2>
            <p>Kami tidak bertanggung jawab atas kerugian atau ketidakakuratan informasi yang dibagikan oleh user. Seluruh interaksi antar pengguna adalah tanggung jawab pribadi masing-masing.</p>
          </section>
        </div>
      </div>
    </div>
  )
}