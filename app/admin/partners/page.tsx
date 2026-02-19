'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Partner {
  id: string
  name: string
  logoUrl: string
  order: number
}

export default function AdminPartnersPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({ name: '', logoUrl: '', order: 0 })
  const [inputType, setInputType] = useState<'url' | 'upload'>('url')

  // Fetch Partners
  useEffect(() => {
    fetch('/api/admin/partners')
      .then(res => res.json())
      .then(data => setPartners(data))
      .catch(console.error)
  }, [])

  // Handle Upload File
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
      
      // Set URL hasil upload ke form
      setFormData({ ...formData, logoUrl: url })
      alert('Logo berhasil diupload! Klik "Tambah Logo" untuk menyimpan.')

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
    if (!formData.name || !formData.logoUrl) return alert('Nama dan Logo wajib diisi!')
    
    setLoading(true)
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          logoUrl: formData.logoUrl,
          order: formData.order || 0
        })
      })

      if (res.ok) {
        const newPartner = await res.json()
        setPartners([...partners, newPartner])
        setFormData({ name: '', logoUrl: '', order: 0 }) // Reset
        if (fileInputRef.current) fileInputRef.current.value = "" // Reset file input
        alert('Logo berhasil ditambahkan!')
      } else {
        alert('Gagal menambahkan logo.')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Hapus logo ini?')) return
    try {
      const res = await fetch('/api/admin/partners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setPartners(partners.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] font-sans pt-20 pb-10">
      
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center py-2 px-4 md:px-[10%] bg-[var(--bg-main)] border-b border-[var(--border-color)] mb-4 shadow-sm">
        <div>
          <span className="text-[#3B82F6] font-mono text-[10px] tracking-widest uppercase">// ADMIN_PARTNERS</span>
          <h1 className="text-xl font-extrabold uppercase">🏆 Kelola Logo</h1>
        </div>
        <Link href="/admin" className="text-xs text-[var(--text-muted)] hover:text-[#3B82F6] transition-colors">
          ← Dashboard
        </Link>
      </header>

      <div className="px-4 md:px-[10%] grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Tambah Logo */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <h2 className="text-sm font-bold mb-4 uppercase">Tambah Logo Baru</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Nama Brand/Channel</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Contoh: YouTube"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3B82F6]"
                />
              </div>

              {/* Tab Switcher (URL vs Upload) */}
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Sumber Logo</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setInputType('url')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded border transition-all ${
                      inputType === 'url' 
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]' 
                        : 'border-[var(--border-color)] text-[var(--text-muted)]'
                    }`}
                  >
                    Link URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputType('upload')}
                    className={`flex-1 py-1 text-[10px] font-bold rounded border transition-all ${
                      inputType === 'upload' 
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]' 
                        : 'border-[var(--border-color)] text-[var(--text-muted)]'
                    }`}
                  >
                    Upload File
                  </button>
                </div>

                {/* Input URL */}
                {inputType === 'url' && (
                  <input 
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3B82F6]"
                  />
                )}

                {/* Input File */}
                {inputType === 'upload' && (
                  <div className="space-y-2">
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-[#3B82F6]/20 file:text-[#3B82F6] hover:file:bg-[#3B82F6]/30"
                    />
                    {uploading && <p className="text-[10px] text-yellow-500 animate-pulse">Sedang mengupload...</p>}
                    
                    {/* Preview jika sudah upload */}
                    {formData.logoUrl && inputType === 'upload' && (
                      <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
                        <span className="text-[10px] text-green-500 font-bold">File siap disimpan.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Preview Logo */}
              {formData.logoUrl && (
                <div className="bg-[var(--bg-main)] p-2 rounded-lg border border-dashed border-[var(--border-color)] flex items-center justify-center h-20">
                  <img src={formData.logoUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}

              {/* Urutan */}
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Urutan (Opsional)</label>
                <input 
                  type="number"
                  value={formData.order}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({...formData, order: val === '' ? 0 : parseInt(val)});
                  }}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3B82F6]"
                />
              </div>

              <button 
                type="submit"
                disabled={loading || uploading || !formData.logoUrl}
                className="w-full bg-[#3B82F6] text-white py-2 rounded-lg font-bold text-sm hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Menyimpan...' : '+ Tambah Logo'}
              </button>
            </form>
          </div>
        </div>

        {/* Daftar Logo */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
            <h2 className="text-sm font-bold mb-4 uppercase">Daftar Logo ({partners.length})</h2>
            
            {partners.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[var(--border-color)] rounded-lg">
                <p className="text-[var(--text-muted)] text-sm">Belum ada logo.</p>
                <p className="text-[var(--text-muted)] text-xs mt-1">Gunakan form di samping untuk menambah.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {partners.map((partner) => (
                  <div key={partner.id} className="flex items-center gap-4 bg-[var(--bg-main)] p-3 rounded-lg border border-[var(--border-color)] group hover:border-red-500/30 transition-colors">
                    <div className="w-14 h-14 flex items-center justify-center bg-white rounded border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                      <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-sm truncate">{partner.name}</h3>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{partner.logoUrl}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(partner.id)}
                      className="opacity-50 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 p-2 rounded text-xs font-bold transition-all flex-shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}