'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './write.module.css'
import { submitNewPost, getPostById, updatePost } from './actions'
import { showToast } from '@/components/Toast'

// --- KOMPONEN EDITOR UTAMA ---
function Editor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // PERBAIKAN: Tangkap parameter 'id' (bukan 'edit') agar sesuai tombol Dashboard
  const editId = searchParams.get('id') 

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // State fetching untuk mode edit
  const [isFetching, setIsFetching] = useState(false) 

  // 1. EFEK: Cek Mode Edit saat halaman dibuka
  useEffect(() => {
    if (editId) {
      setIsEditing(true)
      setIsFetching(true) // Mulai loading data
      
      // Ambil data artikel lama berdasarkan ID
      getPostById(editId).then((post) => {
        if (post) {
          setTitle(post.title)
          setContent(post.content || '')
        } else {
          showToast("Artikel tidak ditemukan.", "error")
          router.push('/dashboard')
        }
        setIsFetching(false) // Selesai loading
      }).catch(err => {
        console.error(err)
        setIsFetching(false)
      })
    }
  }, [editId, router])

  // 2. HANDLE SUBMIT (Simpan Baru / Update)
  const handlePublish = async () => {
    if (!title) return showToast("Judul wajib diisi!", "error")

    setLoading(true)
    try {
      let res;
      
      if (isEditing && editId) {
        // --- MODE UPDATE ---
        // Panggil server action updatePost
        res = await updatePost(editId, title, content)
        
        if (res?.success) {
          showToast("Perubahan berhasil disimpan!", "success")
        } else {
          throw new Error("Gagal update")
        }
      } else {
        // --- MODE BARU ---
        // Panggil server action submitNewPost
        res = await submitNewPost(title, content)
        
        if (res?.success) {
          showToast("Artikel berhasil dikirim ke Admin!", "success")
        } else {
            throw new Error("Gagal submit")
        }
      }

      // Redirect balik ke dashboard setelah sukses
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh() // Refresh agar data terbaru muncul
      }, 1000)

    } catch (error) {
      console.error(error)
      showToast("Terjadi kesalahan. Coba lagi.", "error")
      setLoading(false)
    }
  }

  // Tampilan Loading saat mengambil data edit
  if (isFetching) {
    return (
        <div className={styles.container}>
            <div style={{padding:'40px', color:'var(--text-muted)', textAlign:'center'}}>
                Memuat artikel...
            </div>
        </div>
    )
  }

  return (
    <div className={styles.container}>
      
      {/* HEADER EDITOR */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
            {/* Tombol Batal */}
            <Link href="/dashboard" className={styles.btnCancel}>
              Batal
            </Link>
        </div>

        <div className={styles.headerRight}>
             {/* Tombol Simpan / Kirim */}
             <button 
               onClick={handlePublish} 
               className={styles.btnPublish} 
               disabled={loading || !title}
             >
               {loading 
                  ? 'Menyimpan...' 
                  : (isEditing ? 'Simpan Perubahan' : 'Kirim ke Admin')
               }
             </button>
        </div>
      </header>

      {/* AREA MENULIS */}
      <main className={styles.content}>
        <input 
          type="text" 
          className={styles.inputTitle} 
          placeholder="Judul Artikel" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          // autoFocus hanya jika bukan mode edit agar tidak ganggu loading
          autoFocus={!isEditing} 
        />

        <textarea 
          className={styles.inputBody} 
          placeholder="Mulai menulis ceritamu..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </main>
    </div>
  )
}

// --- WRAPPER SUSPENSE (WAJIB UTK NEXT.JS CLIENT COMPONENT) ---
export default function WritePage() {
  return (
    <Suspense fallback={<div style={{padding:'20px'}}>Loading Editor...</div>}>
      <Editor />
    </Suspense>
  )
}