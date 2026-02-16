'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/app/actions'
import { showToast } from '@/components/Toast'
import { createBrowserClient } from '@supabase/ssr'

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
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CharacterCount from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

// Image Cropper
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// ==========================================
// 1. CUSTOM IMAGE COMPONENT (FIXED & IMPROVED)
// ==========================================
const ImageComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [selected, setSelected] = useState(false)
  const width = node.attrs.width || '100%'
  const textAlign = node.attrs.textAlign || 'center'

  // Fungsi untuk update lebar via Slider
  const handleResize = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAttributes({ width: `${e.target.value}%` })
  }

  // Klik di luar untuk deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.image-container')) {
        setSelected(false)
      }
    }
    if (selected) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [selected])

  return (
    <NodeViewWrapper className="image-component" style={{ textAlign: textAlign, margin: '1rem 0' }}>
      {/* PENTING: contentEditable={false} mencegah gambar hilang saat mengetik */}
      <div 
        className={`image-container relative inline-block transition-all ${selected ? 'ring-4 ring-orange-500 rounded' : 'hover:ring-2 hover:ring-gray-400 rounded'}`}
        contentEditable={false} 
        onClick={(e) => { e.stopPropagation(); setSelected(true) }}
        style={{ width: width, maxWidth: '100%', cursor: 'pointer' }}
      >
        <img 
          src={node.attrs.src} 
          alt={node.attrs.alt} 
          className="w-full h-auto rounded block"
        />

        {/* TOOLBAR GAMBAR (Muncul saat diklik) */}
        {selected && (
          <div 
            className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-[#202124] border border-gray-600 shadow-2xl rounded-lg p-2 flex items-center gap-3 z-50 w-max"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Posisi */}
            <div className="flex bg-[#3c4043] rounded p-0.5">
              <button type="button" onClick={() => updateAttributes({ textAlign: 'left' })} className={`p-1.5 rounded hover:bg-gray-600 ${textAlign === 'left' ? 'text-orange-400' : 'text-white'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg></button>
              <button type="button" onClick={() => updateAttributes({ textAlign: 'center' })} className={`p-1.5 rounded hover:bg-gray-600 ${textAlign === 'center' ? 'text-orange-400' : 'text-white'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg></button>
              <button type="button" onClick={() => updateAttributes({ textAlign: 'right' })} className={`p-1.5 rounded hover:bg-gray-600 ${textAlign === 'right' ? 'text-orange-400' : 'text-white'}`}><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg></button>
            </div>

            <div className="w-px h-6 bg-gray-600"></div>

            {/* 2. Slider Ukuran (Resize) */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Size:</span>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={parseInt(width)} 
                onChange={handleResize}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="text-xs text-gray-300 w-8">{parseInt(width)}%</span>
            </div>

            <div className="w-px h-6 bg-gray-600"></div>

            {/* 3. Tombol Hapus */}
            <button type="button" onClick={deleteNode} className="p-1.5 hover:bg-red-900/50 text-red-400 rounded transition-colors" title="Hapus Gambar">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
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

// ==========================================
// 2. EXTENSIONS & UTILS
// ==========================================

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: Record<string, any>) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
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
// 3. MAIN COMPONENT
// ==========================================
export default function CreatePostClient({ userId, profile }: { userId: string, profile: any }) {
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
  
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline, 
      TextAlign.configure({ types: ['heading', 'paragraph'] }), 
      TextStyle, 
      Color, 
      Highlight.configure({ multicolor: true }), 
      CustomImage, 
      Link, 
      Placeholder.configure({ placeholder: 'Tulis cerita menarik di sini...' }), 
      FontFamily, FontSize, Subscript, Superscript, CharacterCount, Table, TableRow, TableCell, TableHeader,
    ],
    content: '',
    editorProps: {
      attributes: { 
        class: 'focus:outline-none min-h-[400px] text-lg leading-relaxed prose prose-invert max-w-none' 
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) { handleFileSelect(event.dataTransfer.files[0]); return true }
        return false
      },
    },
  })

  const closeAllDropdowns = useCallback(() => {
    setShowHeadingMenu(false)
    setShowFontMenu(false)
    setShowColorPicker(false)
    setShowEmojiPicker(false)
  }, [])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return showToast("Hanya file gambar!", "error")
    if (file.size > 5 * 1024 * 1024) return showToast("Maksimal 5MB!", "error")
    setCurrentFile(file)
    const reader = new FileReader()
    reader.onload = () => { setOriginalImage(reader.result as string); setCropModalOpen(true) }
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
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height)
    
    canvas.toBlob(async (blob) => {
      if (!blob) { setLoading(false); return }
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
      try {
        const { error } = await supabase.storage.from('avatars').upload(`thumbnails/${fileName}`, blob)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`thumbnails/${fileName}`)
        editor.chain().focus().setImage({ src: publicUrl, alt: 'Image' }).run()
        showToast("Gambar ditambahkan!", "success")
        setCropModalOpen(false); setOriginalImage(null); setCurrentFile(null)
      } catch (error) { showToast("Gagal upload", "error") } finally { setLoading(false) }
    }, 'image/jpeg', 0.9)
  }

  const handleSubmit = async () => {
    if (!title.trim()) return showToast("Judul wajib diisi!", "error")
    if (!editor) return
    const content = editor.getHTML()
    if (!content || content === '<p></p>') return showToast("Konten tidak boleh kosong!", "error")
    setLoading(true)
    try {
      const result = await createPost(title, content)
      if (result.success) { showToast("Berhasil!", "success"); router.push('/dashboard') }
      else { showToast(result.error || "Gagal", "error") }
    } catch (err: any) { showToast(err.message || "Error", "error") } finally { setLoading(false) }
  }

  const setLink = useCallback(() => {
    if (!editor) return
    if (linkUrl === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    setShowLinkModal(false); setLinkUrl('')
  }, [editor, linkUrl])

  const insertEmoji = (emoji: string) => { 
    editor?.chain().focus().insertContent(emoji).run()
  }

  if (!editor) return <div className="min-h-screen flex items-center justify-center bg-[#202124]"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>

  const TBtn = ({ onClick, active, disabled, children, title }: any) => (
    <button 
      type="button" 
      onClick={(e) => { e.stopPropagation(); onClick(e); }} 
      disabled={disabled} 
      title={title} 
      className={`p-2 rounded hover:bg-[#3c4043] transition-colors disabled:opacity-30 flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#3c4043] text-orange-400' : 'text-gray-300'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#202124] flex flex-col font-sans" onClick={closeAllDropdowns}>
      
      {/* MODAL CROP */}
      {cropModalOpen && originalImage && ( 
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => { setCropModalOpen(false); setOriginalImage(null) }}>
          <div className="bg-[#292a2d] p-4 rounded-xl max-w-2xl w-full border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4 text-white">Crop Gambar</h3>
            <div className="bg-[#202124] flex justify-center p-2 rounded-lg overflow-auto max-h-[60vh]">
              <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop}>
                <img ref={imageRef} src={originalImage} alt="Crop" onLoad={onImageLoad}/>
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setCropModalOpen(false); setOriginalImage(null) }} className="px-4 py-2 rounded bg-[#3c4043] text-white hover:bg-gray-600">Batal</button>
              <button onClick={processAndUpload} disabled={loading} className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600">{loading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </div>
        </div> 
      )}
      
      {/* MODAL LINK */}
      {showLinkModal && ( 
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowLinkModal(false)}>
          <div className="bg-[#292a2d] p-6 rounded-xl w-full max-w-md border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4 text-white">Masukkan Link</h3>
            <input type="url" placeholder="https://example.com" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-4 py-3 bg-[#202124] border border-gray-600 rounded-lg mb-4 focus:outline-none focus:border-orange-500 text-white" autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 rounded bg-[#3c4043] text-white hover:bg-gray-600">Batal</button>
              <button onClick={setLink} className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600">Simpan</button>
            </div>
          </div>
        </div> 
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-[200] bg-[#292a2d] border-b border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#3c4043] rounded-full text-gray-300"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button onClick={handleSubmit} disabled={loading || !title.trim()} className="px-4 sm:px-5 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-full disabled:opacity-50 transition-colors flex items-center gap-2">
             {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>}
             <span className="hidden sm:inline">{loading ? 'Menyimpan...' : 'Publikasikan'}</span>
             <span className="sm:hidden">{loading ? '...' : 'Post'}</span>
          </button>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="sticky top-[53px] sm:top-[58px] z-[500] bg-[#292a2d] border-b border-gray-700 relative">
        <div className="flex flex-wrap items-center gap-1 px-2 py-2">
          
          <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></TBtn>
          <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg></TBtn>

          <div className="w-px h-5 bg-gray-600 mx-1 flex-shrink-0"></div>

          {/* FONT DROPDOWN */}
          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => { closeAllDropdowns(); setShowFontMenu(!showFontMenu) }} className="flex items-center gap-1 px-2 py-1.5 hover:bg-[#3c4043] rounded text-xs text-gray-300 border border-transparent hover:border-gray-600">
              <span className="max-w-[60px] truncate">{editor.getAttributes('textStyle').fontFamily || 'Font'}</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showFontMenu && (
              <div className="absolute top-full left-0 mt-1 bg-[#292a2d] border border-gray-600 rounded-lg shadow-xl py-1 min-w-[150px] max-h-60 overflow-y-auto z-[1000]">
                {fontList.map(font => (
                  <button key={font} onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().setFontFamily(font).run(); setShowFontMenu(false) }} style={{ fontFamily: font }} className="w-full px-4 py-2 text-left hover:bg-[#3c4043] text-sm text-gray-300">{font}</button>
                ))}
              </div>
            )}
          </div>

          {/* HEADING DROPDOWN */}
          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => { closeAllDropdowns(); setShowHeadingMenu(!showHeadingMenu) }} className="flex items-center gap-1 px-2 py-1.5 hover:bg-[#3c4043] rounded text-xs text-gray-300 border border-transparent hover:border-gray-600">
              <span>{editor.isActive('heading', { level: 1 }) ? 'H1' : editor.isActive('heading', { level: 2 }) ? 'H2' : 'Normal'}</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showHeadingMenu && (
              <div className="absolute top-full left-0 mt-1 bg-[#292a2d] border border-gray-600 rounded-lg shadow-xl py-1 min-w-[140px] z-[1000]">
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false) }} className="w-full px-4 py-2 text-left hover:bg-[#3c4043] text-sm text-gray-300">Normal</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false) }} className="w-full px-4 py-2 text-left hover:bg-[#3c4043] text-lg font-bold text-white">Judul Besar</button>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false) }} className="w-full px-4 py-2 text-left hover:bg-[#3c4043] text-base font-bold text-white">Judul Sedang</button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-600 mx-1 flex-shrink-0"></div>

          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><strong className="font-bold">B</strong></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em className="italic font-serif">I</em></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><span className="underline">U</span></TBtn>

          {/* COLOR PICKER */}
          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => { closeAllDropdowns(); setShowColorPicker(!showColorPicker) }} className="p-2 rounded hover:bg-[#3c4043] text-gray-300" title="Warna Teks">
              <div className="flex flex-col items-center justify-center w-5 h-5">
                <span className="font-bold text-xs leading-none">A</span>
                <span className="w-4 h-1 mt-0.5 rounded-sm" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#fff' }}></span>
              </div>
            </button>
            {showColorPicker && ( 
              <div className="absolute top-full left-0 mt-1 bg-[#292a2d] border border-gray-600 rounded-lg shadow-xl p-2 grid grid-cols-5 gap-1 z-[1000] w-40">
                {['#FFFFFF', '#E53935', '#FB8C00', '#43A047', '#1E88E5', '#8E24AA', '#6D4C41', '#757575', '#546E7A', '#EC407A'].map(c => (
                  <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false) }} className="w-6 h-6 rounded-full border border-gray-500 hover:scale-110 transition-transform" style={{ backgroundColor: c }} title={c}></button>
                ))}
              </div> 
            )}
          </div>

          <div className="w-px h-5 bg-gray-600 mx-1 flex-shrink-0"></div>

          {/* ALIGNMENT */}
          <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Rata Kiri">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Rata Tengah">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Rata Kanan">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </TBtn>
          <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Rata Penuh">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
          </TBtn>

          <div className="w-px h-5 bg-gray-600 mx-1 flex-shrink-0"></div>

          <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="List"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg></TBtn>
          <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg></TBtn>
          <TBtn onClick={() => setShowLinkModal(true)} active={editor.isActive('link')} title="Link"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></TBtn>
          <TBtn onClick={() => fileInputRef.current?.click()} title="Upload Gambar"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></TBtn>

          {/* EMOJI PICKER */}
          <div className="relative flex-shrink-0" onClick={e => e.stopPropagation()}>
            <TBtn onClick={() => { closeAllDropdowns(); setShowEmojiPicker(!showEmojiPicker) }} title="Emoji" active={showEmojiPicker}>😊</TBtn>
            {showEmojiPicker && (
              <div 
                className="absolute top-full right-0 mt-2 p-2 bg-[#292a2d] border border-gray-600 rounded-lg shadow-xl z-[1000] w-72"
              >
                <div className="text-xs text-gray-400 mb-2 px-1">Pilih Emoji</div>
                <div className="grid grid-cols-7 gap-1 h-56 overflow-y-auto custom-scrollbar pr-1">
                  {emojis.map((emoji, i) => (
                    <button 
                      key={i} 
                      onMouseDown={(e) => e.preventDefault()} 
                      onClick={() => insertEmoji(emoji)} 
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#3c4043] rounded text-lg emoji-font transition-colors"
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

      {/* EDITOR AREA */}
      <main className="flex-1 bg-[#202124] w-full overflow-y-auto relative z-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <input 
            type="text" 
            placeholder="Judul Artikel" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full text-3xl sm:text-4xl font-bold text-white placeholder-gray-500 outline-none border-none mb-6 bg-transparent" 
          />
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#292a2d] border-t border-gray-700 px-4 py-2 text-xs text-gray-400 flex justify-between items-center relative z-10">
        <span>{editor.storage.characterCount.words()} kata</span>
        <span>{editor.storage.characterCount.characters()} karakter</span>
      </footer>

      {/* CSS */}
      <style jsx global>{`
        .emoji-font, .ProseMirror, .image-toolbar {
          font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Android Emoji", "EmojiSymbols", sans-serif;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #202124; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7280; }

        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #6B7280; pointer-events: none; height: 0; }
        .ProseMirror:focus { outline: none; }
        .ProseMirror { color: #E5E7EB; min-height: 300px; }
        
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #FFFFFF; line-height: 1.2; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #FFFFFF; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #FFFFFF; }
        
        .ProseMirror p { margin-bottom: 1em; line-height: 1.8; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 0.5rem; display: block; }
        
        .ProseMirror blockquote { 
          border-left: 4px solid #F97316; 
          padding-left: 1rem; 
          margin: 1.5rem 0; 
          font-style: italic; 
          color: #9CA3AF; 
          background: rgba(249, 115, 22, 0.1);
          padding: 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .ProseMirror a { color: #F97316; text-decoration: underline; cursor: pointer; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1rem 0; }
        .ProseMirror li { margin-bottom: 0.5rem; }
        
        /* Range slider styling */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #F97316;
          cursor: pointer;
          margin-top: -6px;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #4B5563;
          border-radius: 2px;
        }
        
        .image-component { display: block; overflow: visible; position: relative; }
      `}</style>
    </div>
  )
}