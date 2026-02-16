'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { compressImage } from '@/lib/compressor' // Import helper kompres

export default function CreatePostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // State untuk info kompresi
  const [originalSize, setOriginalSize] = useState<string | null>(null)
  const [compressedSize, setCompressedSize] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fungsi Format Ukuran File
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    
    // 1. Tampilkan ukuran asli
    setOriginalSize(formatBytes(file.size))
    setCompressedSize(null) // Reset ukuran kompresi

    setUploading(true)

    try {
      // 2. Kompres gambar
      // Maksimal lebar 1920px, kualitas 80%
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8
      })

      // 3. Tampilkan ukuran setelah kompresi
      setCompressedSize(formatBytes(compressedFile.size))

      // 4. Upload ke Supabase
      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Pakai bucket yang sama atau buat baru
        .upload(filePath, compressedFile, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      
    } catch (error) {
      console.error(error)
      alert('Gagal mengunggah gambar.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return alert('Judul wajib diisi!')

    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl })
      })

      if (res.ok) {
        alert('Karya berhasil dipublikasikan!')
        router.push('/')
        router.refresh()
      } else {
        alert('Gagal mempublikasikan karya.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent py-10">
      <div className="max-w-2xl mx-auto px-4">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[var(--text-main)] uppercase">Buat Karya Baru</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Bagikan ide kreatifmu kepada dunia.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          
          {/* Input Judul */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block">Judul</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul yang menarik..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-[#3B82F6] transition-colors"
              required
            />
          </div>

          {/* Input Konten */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block">Konten</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Tuliskan ceritamu di sini..."
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-3 outline-none focus:border-[#3B82F6] transition-colors resize-none"
            />
          </div>

          {/* Upload Gambar */}
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block">Gambar (Opsional)</label>
            
            <div className="flex gap-3 items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] text-sm font-bold rounded-lg hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors disabled:opacity-50"
              >
                {uploading ? 'Memproses...' : 'Pilih Gambar'}
              </button>
              
              {/* Info Kompresi */}
              {originalSize && (
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <span className="line-through opacity-50">{originalSize}</span>
                  <span>→</span>
                  <span className="text-green-500 font-bold">{compressedSize || '...'}</span>
                </div>
              )}
            </div>

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Preview Gambar */}
            {imageUrl && (
              <div className="mt-4 relative group">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full max-h-[400px] object-cover rounded-lg border border-[var(--border-color)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('')
                    setOriginalSize(null)
                    setCompressedSize(null)
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Hapus
                </button>
              </div>
            )}
            
            <p className="text-[10px] text-[var(--text-muted)] mt-2">
              *Gambar akan otomatis dikecilkan (max 1920px) & diubah ke format WebP untuk performa terbaik.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-[#3B82F6] text-white py-3 rounded-lg font-bold hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Menyimpan...' : 'Publikasikan'}
          </button>

        </form>
      </div>
    </div>
  )
}