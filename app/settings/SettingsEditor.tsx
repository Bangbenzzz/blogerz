'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'

export default function SettingsEditor({ profile, userEmail }: { profile: any, userEmail: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Avatar States
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form States
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    status: profile?.status || 'Warga',
    institution: profile?.institution || '',
    major: profile?.major || '',
    address: profile?.address || '',
    phone: profile?.phone || '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        status: profile.status || 'Warga',
        institution: profile.institution || '',
        major: profile.major || '',
        address: profile.address || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // === HANDLER AVATAR ===
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar! Maksimal 2MB.', 'error')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDeletePhoto = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/settings', { method: 'DELETE' })
      setShowDeleteConfirm(false)
      setPreviewUrl(null)
      setSelectedFile(null)
      router.refresh()
      showToast('Foto profil dihapus.', 'info')
    } catch (error) {
      showToast('Gagal menghapus foto.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // === HANDLER USERNAME: cegah @, spasi, uppercase, dll ===
  const handleUsernameChange = (rawValue: string) => {
    // 1) hapus semua "@"
    // 2) lowercase
    // 3) hapus spasi
    // 4) hanya izinkan huruf, angka, underscore
    const cleaned = rawValue
      .replace(/@/g, '')
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_]/g, '')

    setFormData((prev) => ({ ...prev, username: cleaned }))
  }

  // === HANDLER SIMPAN DATA (DENGAN REDIRECT KE PROFIL) ===
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)

    try {
      let finalAvatarUrl = profile?.avatarUrl

      // 1. Upload Avatar jika ada file baru
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(filePath)

        finalAvatarUrl = publicUrl
      }

      // 2. Kirim data ke API
      const payload = {
        ...formData,
        avatarUrl: finalAvatarUrl,
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Failed to update')
      }

      setPreviewUrl(null)
      setSelectedFile(null)
      showToast('Profil berhasil disimpan!', 'success')

      // Redirect ke profil user
      if (formData.username) {
        router.push(`/user/${formData.username}`)
      } else if (profile?.id) {
        router.push(`/user/${profile.id}`)
      } else {
        router.push('/')
      }

      router.refresh()
    } catch (error: any) {
      console.error(error)
      showToast(error?.message || 'Gagal menyimpan profil.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* ===== KARTU UTAMA ===== */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
        {/* --- BAGIAN FOTO PROFIL --- */}
        <div className="flex flex-col items-center gap-4 mb-8 pb-8 border-b border-[var(--border-color)]">
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[var(--bg-main)] border-2 border-[#3B82F6] flex items-center justify-center cursor-pointer relative group transition-transform hover:scale-105"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-[#3B82F6]">
                {formData.name?.[0]?.toUpperCase() || 'U'}
              </span>
            )}

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>

          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />

          <div className="text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-bold text-[var(--text-main)] hover:text-[#3B82F6] transition-colors"
            >
              Ganti Foto
            </button>
            {profile?.avatarUrl && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Hapus Foto
                </button>
              </div>
            )}
          </div>

          {previewUrl && (
            <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-full">
              <span className="text-xs text-blue-500 font-medium">Foto baru dipilih</span>
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null)
                  setSelectedFile(null)
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕ Batal
              </button>
            </div>
          )}
        </div>

        {/* --- FORM IDENTITAS DASAR --- */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 block ml-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] transition-all focus:ring-2 focus:ring-[#3B82F6]/20"
                placeholder="Nama kamu..."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 block ml-1">
                Username
              </label>

              {/* PREFIX @ + INPUT BERSIH */}
              <div className="flex items-center w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl overflow-hidden focus-within:border-[#3B82F6] transition-all focus-within:ring-2 focus-within:ring-[#3B82F6]/20">
                <span className="px-4 text-sm font-bold text-[var(--text-muted)] select-none">@</span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="flex-1 bg-transparent px-0 py-2.5 pr-4 text-sm outline-none"
                  placeholder="username"
                  inputMode="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              <p className="text-[11px] text-[var(--text-muted)] mt-2 ml-1">
                Hanya huruf/angka/underscore. Tanpa spasi & tanpa simbol.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 block ml-1">
              Bio Singkat
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] resize-none transition-all focus:ring-2 focus:ring-[#3B82F6]/20"
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
          </div>
        </div>
      </div>

      {/* ===== KARTU STATUS & DETAIL ===== */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm transition-all duration-300">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 border-b border-[var(--border-color)] pb-2">
          Info Akademik & Kontak
        </h3>

        <div className="mb-6">
          <label className="block text-xs font-bold mb-1.5 ml-1">Status Saat Ini</label>
          <div className="relative">
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full appearance-none bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3B82F6] cursor-pointer transition-all focus:ring-2 focus:ring-[#3B82F6]/20"
            >
              <option value="Warga">Warga / Umum</option>
              <option value="Pelajar">Pelajar (Sekolah)</option>
              <option value="Mahasiswa">Mahasiswa (Kuliah)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {formData.status !== 'Warga' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-xs font-bold mb-1.5 ml-1">
                {formData.status === 'Pelajar' ? 'Nama Sekolah' : 'Nama Universitas / Kampus'}
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] transition-all focus:ring-2 focus:ring-[#3B82F6]/20"
                placeholder={formData.status === 'Pelajar' ? 'Contoh: SMAN 1 Jakarta' : 'Contoh: Universitas Indonesia'}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 ml-1">
                {formData.status === 'Pelajar' ? 'Jurusan / Kelas' : 'Program Studi (Prodi)'}
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] transition-all focus:ring-2 focus:ring-[#3B82F6]/20"
                placeholder={formData.status === 'Pelajar' ? 'Contoh: IPA / XII RPL 1' : 'Contoh: Ilmu Komputer'}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 ml-1">No. WhatsApp</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] transition-all focus:ring-2 focus:ring-[#3B82F6]/20"
              placeholder="0812..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 ml-1">Alamat Domisili</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3B82F6] transition-all focus:ring-2 focus:ring-[#3B82F6]/20"
              placeholder="Kota / Kabupaten"
            />
          </div>
        </div>
      </div>

      {/* TOMBOL SIMPAN */}
      <div className="flex justify-end pt-2 pb-10">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-2.5 bg-[#3B82F6] text-white text-sm font-bold rounded-full hover:bg-[#2563EB] disabled:opacity-50 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      {/* MODAL HAPUS FOTO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Hapus Foto Profil?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleDeletePhoto}
                disabled={isLoading}
                className="w-full py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus Foto'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-2.5 border border-[var(--border-color)] rounded-xl text-sm font-bold hover:bg-[var(--bg-card)] transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
