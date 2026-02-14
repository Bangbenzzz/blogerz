'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/app/actions'
import { showToast } from '@/components/Toast'

interface Props {
  userId: string
  profile: any
}

export default function CreatePostClient({ userId, profile }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      showToast("Judul tidak boleh kosong!", "error")
      return
    }

    setLoading(true)

    try {
      const result = await createPost(title, content)
      if (result.success) {
        showToast("Karya berhasil dibuat! Menunggu persetujuan admin.", "success")
        router.push('/dashboard')
      } else {
        showToast(result.error || "Gagal membuat karya", "error")
      }
    } catch (err) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="px-4 md:px-[5%] py-6 md:py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] mb-2">
            Buat Karya Baru
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Tulis karyamu dan bagikan dengan komunitas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[var(--text-main)] mb-2">
              Judul Karya
            </label>
            <input
              type="text"
              placeholder="Masukkan judul..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--text-main)] mb-2">
              Isi Karya
            </label>
            <textarea
              placeholder="Tulis ceritamu..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-colors min-h-[300px] resize-y"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] text-sm font-bold rounded-full hover:border-[var(--accent)] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-6 py-3 bg-[var(--accent)] text-black text-sm font-bold rounded-full hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Menyimpan...' : 'Kirim Karya'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}