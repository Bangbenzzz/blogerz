import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text-main)] uppercase">
            Tentang <span className="text-[#3B82F6]">CERMATI</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Membangun ekosistem digital bagi para pemikir, penulis, dan inovator untuk berbagi gagasan tanpa batas.
          </p>
        </section>

        {/* Visi & Misi Section */}
        <div className="grid md:grid-cols-2 gap-12 pt-10 border-t border-[var(--border-color)]">
          <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-[#3B82F6]">Visi</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Menjadi platform publikasi paling tepercaya dan inklusif di Indonesia yang mengedepankan kualitas konten, orisinalitas ide, serta kenyamanan dalam bertukar informasi secara cerdas dan beradab.
            </p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-[#3B82F6]">Misi</h2>
            <ul className="space-y-3 text-[var(--text-muted)]">
              <li className="flex gap-3">
                <span className="text-[#3B82F6] font-bold">01.</span>
                <span>Menyediakan wadah bagi penulis untuk membagikan karya ilmiah dan kreatif secara profesional.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#3B82F6] font-bold">02.</span>
                <span>Membangun komunitas literasi yang kritis dan bertanggung jawab atas setiap publikasi yang dibagikan.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#3B82F6] font-bold">03.</span>
                <span>Menghadirkan teknologi publikasi modern yang cepat, aman, dan mudah diakses oleh semua kalangan.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Filosofi Nama */}
        <section className="bg-[var(--bg-card)] p-8 md:p-12 rounded-3xl border border-[var(--border-color)] text-center space-y-6">
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Filosofi "CERMATI"</h2>
          <p className="text-[var(--text-muted)] italic leading-relaxed">
            "Berasal dari kata cermat, platform ini dirancang agar setiap pembaca dan penulis dapat memperhatikan, mengamati, dan memahami setiap detail informasi dengan teliti. Kami percaya bahwa setiap tulisan punya kekuatan untuk mengubah perspektif jika dibaca dengan cermat."
          </p>
        </section>

        {/* Call to Action */}
        <div className="text-center pt-10">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-[#3B82F6] text-white py-4 px-10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#2563EB] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all"
          >
            Mulai Menjelajah
          </Link>
        </div>

      </div>
    </div>
  )
}