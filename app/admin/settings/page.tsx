'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminSettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    site_name: 'CERMATI',
    site_logo: '',
    site_description: ''
  })

  // Fetch Settings saat load
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.site_name) setFormData(prev => ({ ...prev, site_name: data.site_name }))
        if (data.site_logo) setFormData(prev => ({ ...prev, site_logo: data.site_logo }))
        if (data.site_description) setFormData(prev => ({ ...prev, site_description: data.site_description }))
      })
      .catch(console.error)
  }, [])

  // Handle Upload Logo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    setUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData
      })

      if (!res.ok) throw new Error('Upload failed')
      
      const { url } = await res.json()
      setFormData({ ...formData, site_logo: url })
      alert('Logo berhasil diupload! Klik "Simpan Perubahan" untuk menyimpan.')

    } catch (error) {
      console.error(error)
      alert('Gagal upload gambar.')
    } finally {
      setUploading(false)
    }
  }

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        alert('Pengaturan berhasil disimpan!')
        router.refresh() // Refresh server components
      } else {
        alert('Gagal menyimpan pengaturan.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] font-sans pb-10">
      
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center py-4 px-4 md:px-[10%] bg-[var(--bg-main)] border-b border-[var(--border-color)] mb-8">
        <div>
          <span className="text-[#3B82F6] font-mono text-[10px] tracking-widest uppercase">// ADMIN_SETTINGS</span>
          <h1 className="text-xl font-extrabold uppercase">⚙️ Pengaturan Situs</h1>
        </div>
        <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[#3B82F6] transition-colors">
          ← Dashboard
        </Link>
      </header>

      <div className="px-4 md:px-[10%] max-w-3xl">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
          <h2 className="text-sm font-bold mb-6 uppercase">Konfigurasi Umum</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nama Website */}
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Nama Website</label>
              <input 
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData({...formData, site_name: e.target.value})}
                placeholder="CERMATI"
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3B82F6]"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Akan tampil di Header dan Tab Browser.</p>
            </div>

            {/* Logo URL / Upload */}
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Logo Website</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={formData.site_logo}
                  onChange={(e) => setFormData({...formData, site_logo: e.target.value})}
                  placeholder="https://..."
                  className="flex-grow bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3B82F6]"
                />
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-bold rounded-lg hover:border-[#3B82F6] transition-colors whitespace-nowrap"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              
              {/* Preview Logo */}
              {formData.site_logo && (
                <div className="mt-3 p-3 bg-[var(--bg-main)] border border-dashed border-[var(--border-color)] rounded-lg flex items-center gap-3">
                  <img src={formData.site_logo} alt="Logo Preview" className="h-8 w-auto object-contain" />
                  <span className="text-[10px] text-[var(--text-muted)]">Preview Logo</span>
                </div>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Deskripsi Singkat</label>
              <textarea 
                value={formData.site_description}
                onChange={(e) => setFormData({...formData, site_description: e.target.value})}
                rows={3}
                placeholder="Platform menulis untuk para developer..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3B82F6] resize-none"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Digunakan untuk SEO dan Preview di sosial media.</p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B82F6] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}