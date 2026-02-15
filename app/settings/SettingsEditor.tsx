'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'

export default function SettingsEditor({ profile, userEmail }: { profile: any, userEmail: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    bio: profile?.bio || ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran file terlalu besar! Maksimal 2MB.", "error")
      return
    }
    
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let finalAvatarUrl = profile?.avatarUrl

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        finalAvatarUrl = publicUrl
      }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          avatarUrl: finalAvatarUrl
        })
      })

      if (!res.ok) throw new Error('Failed to update')

      setPreviewUrl(null)
      setSelectedFile(null)
      showToast("Profil berhasil disimpan!", "success")
      router.refresh()

    } catch (error) {
      console.error(error)
      showToast("Gagal menyimpan profil.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePhoto = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/settings', {
        method: 'DELETE'
      })
      setShowDeleteConfirm(false)
      router.refresh()
      showToast("Foto profil dihapus.", "info")
    } catch (error) {
      showToast("Gagal menghapus foto.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Border Avatar Biru */}
          <div 
            className="w-24 h-24 rounded-full overflow-hidden bg-[var(--bg-main)] border-2 border-[#3B82F6] flex items-center justify-center cursor-pointer relative group"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              // Inisial Biru
              <span className="text-3xl font-bold text-[#3B82F6]">
                {formData.name?.[0]?.toUpperCase() || 'A'}
              </span>
            )}
            
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold">Ganti Foto</span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{formData.name || 'User'}</h2>
          </div>

          {profile?.avatarUrl && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 text-xs hover:underline"
            >
              Hapus Foto
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1 block">Nama</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              // Focus Border Biru
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1 block">Username</label>
            <input 
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              // Focus Border Biru
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[#3B82F6]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1 block">Email</label>
            <input 
              type="email"
              value={userEmail}
              disabled
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-muted)] cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1 block">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={3}
              // Focus Border Biru
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-[#3B82F6] resize-none"
            />
          </div>

          {/* Preview Box Biru */}
          {previewUrl && (
            <div className="p-4 bg-[#3B82F6]/10 border border-[#3B82F6] rounded-lg">
              <p className="text-xs text-[#3B82F6] mb-2">Preview foto baru:</p>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  // Tombol Biru
                  className="flex-1 py-2 bg-[#3B82F6] text-white text-sm font-bold rounded-lg hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {isLoading ? 'Menyimpan...' : 'Simpan Foto'}
                </button>
                <button 
                  onClick={() => { setPreviewUrl(null); setSelectedFile(null) }}
                  className="px-4 py-2 border border-[var(--border-color)] text-sm rounded-lg hover:bg-[var(--bg-main)]"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={handleSave}
            disabled={isLoading || !!previewUrl}
            // Tombol Utama Biru
            className="w-full py-3 bg-[#3B82F6] text-white font-bold rounded-lg hover:bg-[#2563EB] disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Delete Photo Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-2">Hapus Foto Profil?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 border border-[var(--border-color)] rounded-lg text-sm font-bold"
              >
                Batal
              </button>
              <button 
                onClick={handleDeletePhoto}
                disabled={isLoading}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}