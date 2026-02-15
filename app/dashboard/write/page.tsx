'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { submitNewPost, getPostById, updatePost } from './actions'
import { showToast } from '@/components/Toast'

// --- KOMPONEN EDITOR UTAMA ---
function Editor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const editId = searchParams.get('id') 

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isFetching, setIsFetching] = useState(false) 

  useEffect(() => {
    if (editId) {
      setIsEditing(true)
      setIsFetching(true)
      
      getPostById(editId).then((post) => {
        if (post) {
          setTitle(post.title)
          setContent(post.content || '')
        } else {
          showToast("Artikel tidak ditemukan.", "error")
          router.push('/dashboard')
        }
        setIsFetching(false)
      }).catch(err => {
        console.error(err)
        setIsFetching(false)
      })
    }
  }, [editId, router])

  const handlePublish = async () => {
    if (!title) return showToast("Judul wajib diisi!", "error")

    setLoading(true)
    try {
      let res;
      
      if (isEditing && editId) {
        res = await updatePost(editId, title, content)
        
        if (res?.success) {
          showToast("Perubahan berhasil disimpan!", "success")
        } else {
          throw new Error("Gagal update")
        }
      } else {
        res = await submitNewPost(title, content)
        
        if (res?.success) {
          showToast("Artikel berhasil dikirim ke Admin!", "success")
        } else {
            throw new Error("Gagal submit")
        }
      }

      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1000)

    } catch (error) {
      console.error(error)
      showToast("Terjadi kesalahan. Coba lagi.", "error")
      setLoading(false)
    }
  }

  if (isFetching) {
    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)]">
            Memuat artikel...
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] max-w-3xl mx-auto relative px-4 py-6">
      
      {/* HEADER EDITOR */}
      <header className="sticky top-0 z-50 flex justify-between items-center py-4 px-4 md:px-0 bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)] mb-8">
        <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Batal
            </Link>
        </div>

        <div className="flex items-center gap-2">
             {/* Tombol Biru */}
             <button 
               onClick={handlePublish} 
               className="bg-[#3B82F6] text-white px-6 py-2 text-sm font-bold rounded-full hover:bg-[#2563EB] transition-all disabled:opacity-50" 
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
      <main className="flex flex-col gap-6">
        <input 
          type="text" 
          className="w-full bg-transparent border-none text-4xl font-extrabold text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] placeholder:opacity-50 focus:outline-none" 
          placeholder="Judul Artikel" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus={!isEditing} 
        />

        <textarea 
          className="w-full bg-transparent border-none text-lg text-[var(--text-main)] outline-none placeholder:text-[var(--text-muted)] placeholder:opacity-50 min-h-[60vh] resize-none leading-relaxed focus:outline-none" 
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
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)]">Loading Editor...</div>}>
      <Editor />
    </Suspense>
  )
}