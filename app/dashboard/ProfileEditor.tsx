'use client'

import { useState, useRef, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { updateProfile, deleteProfilePhoto } from './actions'
import styles from './dashboard.module.css'
import { showToast } from '@/components/Toast'

export default function ProfileEditor({ profile, userEmail }: { profile: any, userEmail: string | undefined }) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // --- STATE BARU UNTUK MODAL KONFIRMASI ---
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // State Form Data
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    username: profile?.username || '',
    bio: profile?.bio || ''
  })

  // Sinkronisasi data saat profil berubah
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
    
    // Validasi Ukuran File (Max 2MB)
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

      // Upload Foto Baru (Jika Ada)
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

  // --- FUNGSI EKSEKUSI HAPUS FOTO (Dipanggil dari Modal) ---
  const executeDeletePhoto = async () => {
    setIsDeleting(true)
    try {
      await deleteProfilePhoto()
      showToast("Foto profil dihapus.", "info")
      
      // Tutup modal
      setShowDeleteConfirm(false)
      
      // Refresh halaman agar gambar hilang dari UI
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
      {/* FORM UTAMA */}
      <div className={styles.profileCard}>
        
        {/* BAGIAN FOTO */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
            {/* Prioritas: Preview -> DB -> Placeholder */}
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className={styles.avatarImage} />
            ) : profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {formData.name ? formData.name[0].toUpperCase() : 'U'}
              </div>
            )}
            
            <div className={styles.avatarOverlay}>
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
               className={styles.btnRemovePhoto}
               onClick={(e) => {
                 e.preventDefault()
                 setShowDeleteConfirm(true) // BUKA MODAL CUSTOM
               }}
               disabled={isDeleting}
             >
               Hapus Foto
             </button>
          )}
        </div>

        {/* BAGIAN INPUT TEKS */}
        <div className={styles.infoSection}>
          <div className={styles.inputGroup}>
            <label>Nama Lengkap</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nama kamu"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="username_unik"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Bio</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Ceritakan sedikit tentang dirimu..."
            />
          </div>

          <button 
            className={styles.btnSave} 
            onClick={handleSaveWithUpload}
            disabled={isLoading}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* MODAL PREVIEW CROPPER (JIKA ADA UPLOAD BARU) */}
      {previewUrl && (
        <div className={styles.cropperOverlay}>
          <div className={styles.cropperModal}>
            <h3>Preview Foto Profil</h3>
            <div className={styles.cropperImageArea}>
              <img src={previewUrl} alt="Preview" />
            </div>
            <div className={styles.cropperControls}>
              <p>Pastikan foto terlihat bagus!</p>
            </div>
            <div className={styles.cropperActions}>
              <button className={styles.btnCancelCrop} onClick={cancelPreview}>
                Batal
              </button>
              <button 
                className={styles.btnSaveCrop} 
                onClick={handleSaveWithUpload}
                disabled={isLoading}
              >
                {isLoading ? 'Mengupload...' : 'Upload & Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS (PENGGANTI ALERT) --- */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <div className={styles.confirmTitle}>Hapus Foto Profil?</div>
            <div className={styles.confirmDesc}>
              Tindakan ini tidak bisa dibatalkan. Foto kamu akan kembali ke inisial huruf.
            </div>
            
            <div className={styles.confirmActions}>
              <button 
                className={styles.btnCancel} 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Batal
              </button>
              
              <button 
                className={styles.btnConfirmDelete} 
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