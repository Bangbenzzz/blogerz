'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { updateProfile, deleteProfilePhoto } from './actions'
import { showToast } from '@/components/Toast'

export default function ProfileEditor({ profile, userEmail }: { profile: any, userEmail: string | undefined }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handleSaveWithUpload = async () => {
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

      const dataToSend = new FormData()
      dataToSend.append('name', formData.name)
      dataToSend.append('username', formData.username)
      dataToSend.append('bio', formData.bio)
      if (finalAvatarUrl) dataToSend.append('avatarUrl', finalAvatarUrl)

      await updateProfile(dataToSend)
      
      setPreviewUrl(null)
      setSelectedFile(null)
      
      showToast("Profil berhasil disimpan!", "success")

    } catch (error) {
      console.error(error)
      showToast("Gagal menyimpan profil.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const executeDeletePhoto = async () => {
    setIsDeleting(true)
    try {
      await deleteProfilePhoto()
      showToast("Foto profil dihapus.", "info")
      setShowDeleteConfirm(false)
      window.location.reload() 
    } catch (error) {
      console.error(error)
      showToast("Gagal menghapus foto.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelPreview = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      {/* FORM UTAMA - Tailwind Grid */}
      <div className="bg-transparent border-none p-0 mb-10 max-w-2xl w-full flex flex-col md:flex-row items-start gap-5">
        
        {/* BAGIAN FOTO */}
        <div className="flex-shrink-0 w-24 flex flex-col items-center gap-2">
          <div 
            className="w-24 h-24 rounded-full overflow-hidden bg-[var(--bg-card)] relative cursor-pointer border border-[var(--border-color)]"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--text-muted)] bg-[var(--bg-card)]">
                {formData.name ? formData.name[0].toUpperCase() : 'U'}
              </div>
            )}
            
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-bold">
              <span>Ganti Foto</span>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*"
            onChange={handleFileChange}
          />

          {profile?.avatarUrl && (
             <button 
               className="bg-transparent border-none text-red-500 text-xs cursor-pointer font-medium"
               onClick={(e) => {
                 e.preventDefault()
                 setShowDeleteConfirm(true)
               }}
               disabled={isDeleting}
             >
               Hapus Foto
             </button>
          )}
        </div>

        {/* BAGIAN INPUT TEKS */}
        <div className="flex-grow w-full flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--text-muted)]">Nama Lengkap</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nama kamu"
              className="bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] p-2 rounded-md text-sm outline-none focus:border-[var(--accent)] w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--text-muted)]">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="username_unik"
              className="bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] p-2 rounded-md text-sm outline-none focus:border-[var(--accent)] w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--text-muted)]">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Ceritakan sedikit tentang dirimu..."
              className="bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-main)] p-2 rounded-md text-sm outline-none focus:border-[var(--accent)] w-full h-[70px] resize-none"
            />
          </div>

          <button 
            className="self-start py-2 px-5 bg-[var(--text-main)] text-[var(--bg-main)] rounded-full font-bold text-sm cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity mt-1"
            onClick={handleSaveWithUpload}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* MODAL PREVIEW CROPPER */}
      {previewUrl && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/85 flex items-center justify-center z-[9999] backdrop-blur-sm p-5">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-5 rounded-2xl w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <h3 className="m-0 text-[var(--text-main)] text-center font-bold">Preview Foto Profil</h3>
            <div className="w-full h-[250px] bg-black rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-[var(--border-color)]">
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="text-center text-[var(--text-muted)] text-xs">
              <p>Pastikan foto terlihat bagus!</p>
            </div>
            <div className="flex justify-between gap-2 mt-2 border-t border-[var(--border-color)] pt-4">
              <button className="flex-1 py-2 rounded-full font-bold text-xs bg-transparent border border-[var(--border-color)] text-[var(--text-main)]" onClick={cancelPreview}>
                Batal
              </button>
              <button 
                className="flex-1 py-2 rounded-full font-bold text-xs bg-[var(--text-main)] text-[var(--bg-main)] border-none"
                onClick={handleSaveWithUpload}
                disabled={isLoading}
              >
                {isLoading ? 'Mengupload...' : 'Upload & Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {showDeleteConfirm && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/60 flex items-center justify-center z-[99999] backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[var(--bg-main)] border border-[var(--border-color)] w-[90%] max-w-xs p-6 rounded-2xl text-center shadow-xl">
            <div className="text-lg font-extrabold text-[var(--text-main)] mb-2">Hapus Foto Profil?</div>
            <div className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
              Tindakan ini tidak bisa dibatalkan. Foto kamu akan kembali ke inisial huruf.
            </div>
            
            <div className="flex gap-2 justify-center">
              <button 
                className="flex-1 py-2 rounded-full text-xs font-bold bg-transparent border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              
              <button 
                className="flex-1 py-2 rounded-full text-xs font-bold bg-red-600 text-white border-none hover:bg-red-700"
                onClick={executeDeletePhoto}
                disabled={isDeleting}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}