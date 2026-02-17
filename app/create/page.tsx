'use client'

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { showToast } from '@/components/Toast'
import { compressImage } from '@/lib/compressor'

// Import Tiptap
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import FontFamily from '@tiptap/extension-font-family'
import { Extension } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'

// Import React Image Crop
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// ==========================================
// DROPDOWN PORTAL COMPONENT
// ==========================================
interface DropdownPortalProps {
  children: ReactNode
  isOpen: boolean
  buttonRef: React.RefObject<HTMLButtonElement | null>
  align?: 'left' | 'right'
}

const DropdownPortal = ({ children, isOpen, buttonRef, align = 'left' }: DropdownPortalProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const scrollX = window.scrollX || document.documentElement.scrollLeft
      let leftPos = rect.left + scrollX
      if (align === 'right') leftPos = rect.right + scrollX - 288
      if (leftPos < 10) leftPos = 10
      setPosition({ top: rect.bottom + scrollY + 4, left: leftPos })
    }
  }, [isOpen, buttonRef, align])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div style={{ position: 'absolute', top: position.top, left: position.left, zIndex: 99999 }}>
      {children}
    </div>,
    document.body
  )
}

// ==========================================
// 1. CUSTOM IMAGE COMPONENT
// ==========================================
const ImageComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [selected, setSelected] = useState(false)
  const width = node.attrs.width || '100%'
  const textAlign = node.attrs.textAlign || 'center'
  const handleResize = (e: React.ChangeEvent<HTMLInputElement>) => updateAttributes({ width: `${e.target.value}%` })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.image-container')) setSelected(false) }
    if (selected) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [selected])

  return (
    <NodeViewWrapper className="image-component" style={{ textAlign: textAlign, margin: '1rem 0' }}>
      <div 
        className={`image-container relative inline-block transition-all ${selected ? 'ring-4 ring-neutral-400 rounded-xl' : 'hover:ring-2 hover:ring-neutral-500/50 rounded-xl'}`}
        contentEditable={false} 
        onClick={(e) => { e.stopPropagation(); setSelected(true) }}
        style={{ width: width, maxWidth: '100%', cursor: 'pointer' }}
      >
        <img src={node.attrs.src} alt={node.attrs.alt} className="w-full h-auto rounded-xl block shadow-lg" />
        {selected && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-neutral-800 border border-neutral-600 shadow-2xl rounded-xl p-2 flex items-center gap-3 z-50 w-max" onClick={(e) => e.stopPropagation()}>
            <div className="flex bg-neutral-700 rounded-lg p-0.5">
              <button type="button" onClick={() => updateAttributes({ textAlign: 'left' })} className={`p-1.5 rounded-lg transition-all ${textAlign === 'left' ? 'bg-neutral-500 text-white' : 'text-neutral-300 hover:bg-neutral-600'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg></button>
              <button type="button" onClick={() => updateAttributes({ textAlign: 'center' })} className={`p-1.5 rounded-lg transition-all ${textAlign === 'center' ? 'bg-neutral-500 text-white' : 'text-neutral-300 hover:bg-neutral-600'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg></button>
              <button type="button" onClick={() => updateAttributes({ textAlign: 'right' })} className={`p-1.5 rounded-lg transition-all ${textAlign === 'right' ? 'bg-neutral-500 text-white' : 'text-neutral-300 hover:bg-neutral-600'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg></button>
            </div>
            <div className="w-px h-6 bg-neutral-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium">Size:</span>
              <input type="range" min="10" max="100" value={parseInt(width)} onChange={handleResize} className="w-24 h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-neutral-400" />
              <span className="text-xs text-neutral-300 font-semibold w-10">{parseInt(width)}%</span>
            </div>
            <div className="w-px h-6 bg-neutral-600"></div>
            <button type="button" onClick={deleteNode} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: '100%', renderHTML: attrs => ({ style: `width: ${attrs.width}; max-width: 100%;` }) },
      textAlign: { default: 'center', renderHTML: attrs => ({ 'data-align': attrs.textAlign }) },
    }
  },
  addNodeView() { return ReactNodeViewRenderer(ImageComponent) },
})

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: { default: null, parseHTML: (el: HTMLElement) => el.style.fontSize || null, renderHTML: (attrs: Record<string, any>) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {} },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
}) as any

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🙂', '😊', '😇', '😍', '😘', '😋', '😜', '😝', '🤐', '😐', '😑', '😶', '😏', '😒','😬', '😌', '😔', '😪', '🤤', '😴', '😷','😵','😎','😕', '😟', '🙁', '😮', '😯', '😲', '😳', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '😤', '😡', '😠', '😈', '👿', '💀', '💩', '👻', '👽', '👾', '👋', '🤚', '✋', '🖖', '👌', '✌️', '👈', '👉', '👆', '👇', '👍', '👎', '✊', '👊', '👏', '🙌', '👐', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜','💔', '💯', '💢', '💥', '💦', '💨', '🔥', '✨', '🌟', '⭐', '🌈', '☀️', '🌙', '⚡', '❄️']
const fontList = ['Arial', 'Arial Black', 'Georgia', 'Tahoma', 'Verdana', 'Times New Roman', 'Courier New', 'Impact', 'Comic Sans MS', 'System UI']

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showHeadingMenu, setShowHeadingMenu] = useState(false)
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  
  // === STATE PENTING UNTUK FIX ERROR ===
  const [mounted, setMounted] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const fontBtnRef = useRef<HTMLButtonElement>(null)
  const headingBtnRef = useRef<HTMLButtonElement>(null)
  const colorBtnRef = useRef<HTMLButtonElement>(null)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // === EFFECT MOUNTED ===
  useEffect(() => {
    setMounted(true)
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }), TextStyle, Color, Highlight.configure({ multicolor: true }), CustomImage, Link, Placeholder.configure({ placeholder: 'Tulis cerita menarik di sini...' }), FontFamily, FontSize, CharacterCount
    ],
    content: '',
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[400px] text-lg leading-relaxed prose prose-invert max-w-none' },
      handleDrop: (view, event, slice, moved) => { if (!moved && event.dataTransfer?.files?.[0]) { handleFileSelect(event.dataTransfer.files[0]); return true } return false },
    },
  })

  // ==========================================
  // LOGIKA EDIT: Fetch Data Post
  // ==========================================
  useEffect(() => {
    const editId = searchParams.get('id')
    if (editId && editor) {
      setIsEditing(true)
      setIsFetching(true)
      
      fetch(`/api/posts/${editId}`)
        .then(res => {
          if (!res.ok) throw new Error('Gagal mengambil data')
          return res.json()
        })
        .then(data => {
          setTitle(data.title)
          editor.commands.setContent(data.content)
        })
        .catch(err => {
          console.error(err)
          showToast("Gagal memuat data artikel", "error")
        })
        .finally(() => {
          setIsFetching(false)
        })
    }
  }, [searchParams, editor])

  const closeAllDropdowns = useCallback(() => { setShowHeadingMenu(false); setShowFontMenu(false); setShowColorPicker(false); setShowEmojiPicker(false) }, [])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return showToast("Hanya file gambar!", "error")
    if (file.size > 10 * 1024 * 1024) return showToast("Maksimal 10MB!", "error")
    
    setCurrentFile(file)
    const reader = new FileReader()
    reader.onload = () => { 
      setOriginalImage(reader.result as string); 
      setCropModalOpen(true) 
    }
    reader.readAsDataURL(file)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 16 / 9))
  }

  const processAndUpload = async () => {
    if (!currentFile || !originalImage || !imageRef.current || !completedCrop || !editor) return
    setLoading(true)
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const image = imageRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY
    
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )
    
    canvas.toBlob(async (blob) => {
      if (!blob) { setLoading(false); return }
      
      const croppedFile = new File([blob], currentFile.name, { type: 'image/jpeg', lastModified: Date.now() })

      try {
        const compressedFile = await compressImage(croppedFile, { maxWidth: 1920, quality: 0.8 })
        const fileName = `${Date.now()}.webp`
        const filePath = `thumbnails/${fileName}`
        
        const { error } = await supabase.storage.from('avatars').upload(filePath, compressedFile)
        if (error) throw error
        
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
        editor.chain().focus().setImage({ src: publicUrl, alt: 'Image' }).run()
        showToast("Gambar ditambahkan!", "success")
        
        setCropModalOpen(false); setOriginalImage(null); setCurrentFile(null)
      } catch (error) {
        showToast("Gagal upload", "error")
      } finally {
        setLoading(false)
      }
    }, 'image/jpeg', 0.95)
  }

  // ==========================================
  // LOGIKA SUBMIT (Buat Baru atau Update)
  // ==========================================
  const handleSubmit = async () => {
    if (!title.trim()) return showToast("Judul wajib diisi!", "error")
    if (!editor) return
    const content = editor.getHTML()
    if (!content || content === '<p></p>') return showToast("Konten tidak boleh kosong!", "error")
    
    setLoading(true)
    try {
      const editId = searchParams.get('id')
      const url = editId ? `/api/posts/${editId}` : '/api/posts'
      const method = editId ? 'PUT' : 'POST'
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title, content }) 
      })

      if (res.ok) { 
        showToast(editId ? "Perubahan berhasil disimpan!" : "Berhasil dipublikasikan!", "success")
        router.push('/my-posts') 
        router.refresh()
      }
      else { 
        const errData = await res.json()
        showToast(errData.error || "Gagal menyimpan", "error") 
      }
    } catch (err: any) { 
      showToast(err.message || "Error", "error") 
    } finally { 
      setLoading(false) 
    }
  }

  const setLink = useCallback(() => {
    if (!editor) return
    if (linkUrl === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setShowLinkModal(false); setLinkUrl('')
  }, [editor, linkUrl])

  const insertEmoji = (emoji: string) => { editor?.chain().focus().insertContent(emoji).run(); setShowEmojiPicker(false) }

  // === LOADING STATE DENGAN MOUNTED CHECK ===
  if (!mounted || !editor || (isEditing && isFetching)) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-neutral-400 text-sm">Memuat artikel...</span>
      </div>
    </div>
  )

  const TBtn = ({ onClick, active, disabled, children, title }: any) => (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick(e); }} disabled={disabled} title={title} 
      className={`p-2 rounded-lg hover:bg-neutral-700 transition-all disabled:opacity-30 flex items-center justify-center flex-shrink-0 ${active ? 'bg-neutral-600 text-white' : 'text-neutral-400'}`}
    >{children}</button>
  )

  const anyDropdownOpen = showFontMenu || showHeadingMenu || showColorPicker || showEmojiPicker

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col font-sans" onClick={closeAllDropdowns}>
      
      {/* BACKDROP */}
      {anyDropdownOpen && (
        <div className="fixed inset-0" style={{ zIndex: 99998 }} onClick={closeAllDropdowns} />
      )}

      {/* MODAL CROP IMAGE */}
      {cropModalOpen && originalImage && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setCropModalOpen(false); setOriginalImage(null) }}>
          <div className="bg-neutral-800 p-6 rounded-2xl max-w-3xl w-full border border-neutral-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-neutral-100 text-lg">Potong Gambar</h3>
              <button onClick={() => { setCropModalOpen(false); setOriginalImage(null) }} className="text-neutral-400 hover:text-neutral-200 transition-colors p-1 hover:bg-neutral-700 rounded-lg">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            
            <div className="bg-neutral-900 flex justify-center p-4 rounded-xl overflow-auto max-h-[60vh] border border-neutral-700">
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)}>
                <img ref={imageRef} src={originalImage} alt="Crop preview" onLoad={onImageLoad} style={{ maxHeight: '60vh', maxWidth: '100%' }} className="rounded-lg" />
              </ReactCrop>
            </div>
            
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => { setCropModalOpen(false); setOriginalImage(null) }} className="px-5 py-2.5 rounded-xl bg-neutral-700 text-neutral-200 text-sm font-semibold hover:bg-neutral-600 transition-colors">Batal</button>
              <button onClick={processAndUpload} disabled={loading} className="px-5 py-2.5 rounded-xl bg-neutral-200 text-neutral-900 text-sm font-semibold hover:bg-white disabled:opacity-50 transition-all flex items-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Processing...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LINK */}
      {showLinkModal && ( 
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowLinkModal(false)}>
          <div className="bg-neutral-800 p-6 rounded-2xl w-full max-w-md border border-neutral-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4 text-neutral-100 text-lg">Masukkan Link</h3>
            <input type="url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent text-neutral-100 placeholder-neutral-500" autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkModal(false)} className="px-5 py-2.5 rounded-xl bg-neutral-700 text-neutral-200 font-semibold hover:bg-neutral-600 transition-colors">Batal</button>
              <button onClick={setLink} className="px-5 py-2.5 rounded-xl bg-neutral-200 text-neutral-900 font-semibold hover:bg-white transition-colors">Simpan</button>
            </div>
          </div>
        </div> 
      )}

      {/* HEADER - DENGAN TOMBOL KEMBALI */}
      <header className="sticky top-0 z-[200] bg-neutral-800/95 backdrop-blur-xl border-b border-neutral-700">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          
          {/* TOMBOL KEMBALI */}
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors p-2 hover:bg-neutral-700 rounded-lg"
            title="Kembali"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span className="hidden sm:inline text-sm font-bold">Kembali</span>
          </button>

          <button onClick={handleSubmit} disabled={loading || !title.trim()} className="px-4 sm:px-6 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-bold rounded-full disabled:opacity-50 transition-all flex items-center gap-2">
             {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>}
             <span className="hidden sm:inline">{loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Publikasikan')}</span>
             <span className="sm:hidden">{loading ? '...' : 'Simpan'}</span>
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="sticky top-[53px] sm:top-[58px] z-[100] bg-neutral-800/95 backdrop-blur-xl border-b border-neutral-700">
        <div className="flex flex-nowrap items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-hide">
          
          <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg></TBtn>
          <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" /></svg></TBtn>
          <div className="w-px h-5 bg-neutral-600 mx-1 flex-shrink-0"></div>

          {/* FONT DROPDOWN */}
          <div className="relative flex-shrink-0">
            <button 
              ref={fontBtnRef}
              onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowFontMenu(!showFontMenu) }} 
              className="flex items-center gap-1 px-2 py-1.5 hover:bg-neutral-700 rounded-lg text-xs text-neutral-400 border border-transparent hover:border-neutral-600 transition-all"
            >
              <span className="max-w-[60px] truncate font-medium">{editor.getAttributes('textStyle').fontFamily || 'Font'}</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>

          {/* HEADING DROPDOWN */}
          <div className="relative flex-shrink-0">
            <button 
              ref={headingBtnRef}
              onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowHeadingMenu(!showHeadingMenu) }} 
              className="flex items-center gap-1 px-2 py-1.5 hover:bg-neutral-700 rounded-lg text-xs text-neutral-400 border border-transparent hover:border-neutral-600 transition-all"
            >
              <span className="font-medium">{editor.isActive('heading', { level: 1 }) ? 'H1' : editor.isActive('heading', { level: 2 }) ? 'H2' : 'Normal'}</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>

          <div className="w-px h-5 bg-neutral-600 mx-1 flex-shrink-0"></div>

          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><strong className="font-bold">B</strong></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em className="italic font-serif">I</em></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><span className="underline">U</span></TBtn>

          {/* COLOR PICKER */}
          <div className="relative flex-shrink-0">
            <button 
              ref={colorBtnRef}
              onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowColorPicker(!showColorPicker) }} 
              className="p-2 rounded-lg hover:bg-neutral-700 text-neutral-400 transition-colors" 
              title="Warna Teks"
            >
              <div className="flex flex-col items-center justify-center w-5 h-5">
                <span className="font-bold text-xs leading-none">A</span>
                <span className="w-4 h-1.5 mt-0.5 rounded-sm" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#e5e5e5' }}></span>
              </div>
            </button>
          </div>

          <div className="w-px h-5 bg-neutral-600 mx-1 flex-shrink-0"></div>

          <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Rata Kiri"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" /></svg></TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Rata Tengah"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="18" y1="18" x2="6" y2="18" /></svg></TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Rata Kanan"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line x1="21" y1="14" x2="3" y2="14" /><line x1="21" y1="18" x2="7" y2="18" /></svg></TBtn>

          <div className="w-px h-5 bg-neutral-600 mx-1 flex-shrink-0"></div>

          <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="List"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1.5" fill="currentColor" /><circle cx="4" cy="12" r="1.5" fill="currentColor" /><circle cx="4" cy="18" r="1.5" fill="currentColor" /></svg></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg></TBtn>
          <TBtn onClick={() => setShowLinkModal(true)} active={editor.isActive('link')} title="Link"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg></TBtn>
          <TBtn onClick={() => fileInputRef.current?.click()} title="Upload Gambar"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg></TBtn>

          {/* EMOJI */}
          <div className="relative flex-shrink-0">
            <button
              ref={emojiBtnRef}
              onClick={(e) => { e.stopPropagation(); closeAllDropdowns(); setShowEmojiPicker(!showEmojiPicker) }}
              className={`p-2 rounded-lg hover:bg-neutral-700 transition-colors ${showEmojiPicker ? 'bg-neutral-600' : ''}`}
              title="Emoji"
            >
              😊
            </button>
          </div>
        </div>
      </div>

      {/* PORTAL DROPDOWNS */}
      <DropdownPortal isOpen={showFontMenu} buttonRef={fontBtnRef}>
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl shadow-2xl shadow-black/50 py-1 min-w-[150px] max-h-60 overflow-y-auto custom-scrollbar">
          {fontList.map(font => (
            <button key={font} onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().setFontFamily(font).run(); setShowFontMenu(false) }} style={{ fontFamily: font }} className="w-full px-4 py-2.5 text-left hover:bg-neutral-700 text-sm text-neutral-200 transition-colors">{font}</button>
          ))}
        </div>
      </DropdownPortal>

      <DropdownPortal isOpen={showHeadingMenu} buttonRef={headingBtnRef}>
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl shadow-2xl shadow-black/50 py-1 min-w-[140px]">
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false) }} className="w-full px-4 py-2.5 text-left hover:bg-neutral-700 text-sm text-neutral-200 transition-colors">Normal</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false) }} className="w-full px-4 py-2.5 text-left hover:bg-neutral-700 text-lg font-bold text-neutral-100 transition-colors">Heading 1</button>
          <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false) }} className="w-full px-4 py-2.5 text-left hover:bg-neutral-700 text-base font-bold text-neutral-100 transition-colors">Heading 2</button>
        </div>
      </DropdownPortal>

      <DropdownPortal isOpen={showColorPicker} buttonRef={colorBtnRef}>
        <div className="bg-neutral-800 border border-neutral-600 rounded-xl shadow-2xl shadow-black/50 p-3">
          <div className="text-xs text-neutral-400 mb-2 font-medium">Pilih Warna</div>
          <div className="grid grid-cols-5 gap-2 w-40">
            {['#fafafa', '#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8'].map(c => (
              <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false) }} className="w-7 h-7 rounded-full border-2 border-neutral-600 hover:scale-110 hover:border-white transition-all shadow-lg" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        </div>
      </DropdownPortal>

      <DropdownPortal isOpen={showEmojiPicker} buttonRef={emojiBtnRef} align="right">
        <div className="p-3 bg-neutral-800 border border-neutral-600 rounded-xl shadow-2xl shadow-black/50 w-72">
          <div className="text-xs text-neutral-400 mb-2 px-1 font-medium">Pilih Emoji</div>
          <div className="grid grid-cols-7 gap-1 h-56 overflow-y-auto custom-scrollbar pr-1">
            {emojis.map((emoji, i) => (
              <button key={i} onMouseDown={(e) => e.preventDefault()} onClick={() => insertEmoji(emoji)} className="w-8 h-8 flex items-center justify-center hover:bg-neutral-700 rounded-lg text-lg transition-colors">{emoji}</button>
            ))}
          </div>
        </div>
      </DropdownPortal>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

      {/* EDITOR AREA */}
      <main className="flex-1 w-full overflow-y-auto relative z-0 bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-6 sm:p-8 shadow-xl">
            <input 
              type="text" 
              placeholder="Judul Artikel..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full text-3xl sm:text-4xl font-bold text-neutral-100 placeholder-neutral-500 outline-none border-none mb-6 bg-transparent" 
            />
            <div className="border-t border-neutral-700 pt-6">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-800/95 backdrop-blur-xl border-t border-neutral-700 px-4 py-3 text-xs text-neutral-400 flex justify-between items-center relative z-10">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
          {editor.storage.characterCount.words()} kata
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
          {editor.storage.characterCount.characters()} karakter
        </span>
      </footer>

      {/* CSS */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #737373; pointer-events: none; height: 0; }
        .ProseMirror:focus { outline: none; }
        .ProseMirror { color: #e5e5e5; min-height: 300px; }
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #fafafa; line-height: 1.2; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #fafafa; }
        .ProseMirror p { margin-bottom: 1em; line-height: 1.8; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.75rem; display: block; margin: 1rem auto; }
        .ProseMirror blockquote { border-left: 4px solid #737373; padding-left: 1rem; margin: 1.5rem 0; font-style: italic; color: #a3a3a3; background: rgba(115, 115, 115, 0.1); padding: 1rem; border-radius: 0 0.75rem 0.75rem 0; }
        .ProseMirror a { color: #60a5fa; text-decoration: underline; cursor: pointer; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror li { margin-bottom: 0.5rem; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #262626; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #525252; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #737373; }
        .image-component { display: block; overflow: visible; position: relative; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}