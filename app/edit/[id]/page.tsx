'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { compressImage } from '@/lib/compressor'
import Link from 'next/link'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  
  const [originalSize, setOriginalSize] = useState<string | null>(null)
  const [compressedSize, setCompressedSize] = useState<string | null>(null)

  // State untuk Modal Hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Ambil data post saat halaman dibuka
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`)
        if (res.ok) {
          const data = await res.json()
          setTitle(data.title)
          setContent(data.content || '')
          setImageUrl(data.imageUrl || '')
        } else {
          alert('Post tidak ditemukan atau Anda bukan pemiliknya.')
          router.push('/')
        }
      } catch (error) {
        console.error(error)
      } finally {
        setPageLoading(false)
      }
    }
    
    fetchPost()
  }, [postId, router])

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
    
    setOriginalSize(formatBytes(file.size))
    setCompressedSize(null)

    setUploading(true)
    try {
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        quality: 0.8
      })
      
      setCompressedSize(formatBytes(compressedFile.size))

      const fileExt = compressedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
      
    } catch (error) {
      console.error(error)
      alert('Gagal upload gambar.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return alert('Judul wajib diisi!')

    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, imageUrl })
      })

      if (res.ok) {
        alert('Karya berhasil diperbarui!')
        router.push('/')
        router.refresh()
      } else {
        alert('Gagal memperbarui karya.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Fungsi Hapus Post
  const handleDeletePost = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setShowDeleteModal(false)
        alert('Karya berhasil dihapus.')
        router.push('/')
        router.refresh()
      } else {
        alert('Gagal menghapus karya.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setDeleting(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* MODAL HAPUS */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-main)] border border-red-500/30 rounded-xl p-6 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">Hapus Karya?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Karya "<span className="font-bold text-[var(--text-main)]">{title}</span>" akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleDeletePost}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-transparent py-10">
        <div className="max-w-2xl mx-auto px-4">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[var(--text-main)] uppercase">Edit Karya</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">Perbarui karyamu di sini.</p>
            </div>
            <Link href="/" className="text-xs text-[var(--text-muted)] hover:text-[#3B82F6] transition-colors">
              ← Batal
            </Link>
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
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2 block">Gambar</label>
              
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] text-sm font-bold rounded-lg hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Memproses...' : 'Ganti Gambar'}
                </button>
                
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
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Tombol Hapus (Kiri) */}
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-500 text-sm font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Hapus Karya
              </button>

              {/* Tombol Simpan (Kanan) */}
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 bg-[#3B82F6] text-white py-3 rounded-lg font-bold hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}