'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/app/actions'
import { showToast } from '@/components/Toast'
import { createBrowserClient } from '@supabase/ssr'

// Import Tiptap Core & Extensions
import { useEditor, EditorContent, Extension, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
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
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CharacterCount from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

// Import Image Cropper
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// ==========================================
// 1. CUSTOM IMAGE COMPONENT
// ==========================================
const ImageComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [selected, setSelected] = useState(false)
  const width = node.attrs.width || '100%'
  const alignment = node.attrs.textAlign || 'center'

  return (
    <NodeViewWrapper className="image-view-component relative group flex flex-col my-4" style={{ alignItems: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>
      <div 
        className={`relative transition-all ${selected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}`}
        style={{ width: width, maxWidth: '100%' }}
        onClick={() => setSelected(!selected)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={node.attrs.src} alt={node.attrs.alt} className="block w-full h-auto rounded-sm" />

        {selected && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-lg border border-gray-300 p-1 flex gap-1 z-50">
            <button type="button" onClick={() => updateAttributes({ textAlign: 'left' })} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
            </button>
            <button type="button" onClick={() => updateAttributes({ textAlign: 'center' })} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
            </button>
            <button type="button" onClick={() => updateAttributes({ textAlign: 'right' })} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
              <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
            <button type="button" onClick={() => updateAttributes({ width: '25%' })} className="text-xs px-2 py-1 hover:bg-gray-100 rounded text-black font-medium">25%</button>
            <button type="button" onClick={() => updateAttributes({ width: '50%' })} className="text-xs px-2 py-1 hover:bg-gray-100 rounded text-black font-medium">50%</button>
            <button type="button" onClick={() => updateAttributes({ width: '100%' })} className="text-xs px-2 py-1 hover:bg-gray-100 rounded text-black font-medium">100%</button>
            <div className="w-px h-4 bg-gray-300 mx-1 self-center"></div>
            <button type="button" onClick={deleteNode} className="p-1.5 rounded hover:bg-red-100 text-red-600">
               <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
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
      width: { default: '100%', renderHTML: attributes => ({ width: attributes.width }) },
      textAlign: { default: 'center', renderHTML: attributes => ({ 'data-text-align': attributes.textAlign }) },
    }
  },
  addNodeView() { return ReactNodeViewRenderer(ImageComponent) },
})

// ==========================================
// 2. EXTENSIONS & UTILS
// ==========================================
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: { setFontSize: (fontSize: string) => ReturnType, unsetFontSize: () => ReturnType }
    lineHeight: { setLineHeight: (lineHeight: string) => ReturnType, unsetLineHeight: () => ReturnType }
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element: HTMLElement) => element.style.fontSize?.replace(/['"]+/g, '') || null,
          renderHTML: (attributes: Record<string, any>) => {
            if (!attributes.fontSize) return {}
            return { style: `font-size: ${attributes.fontSize}` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() { return { types: ['paragraph', 'heading'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        lineHeight: {
          default: null,
          parseHTML: (element: HTMLElement) => element.style.lineHeight || null,
          renderHTML: (attributes: Record<string, any>) => {
            if (!attributes.lineHeight) return {}
            return { style: `line-height: ${attributes.lineHeight}` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }) => this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight })),
      unsetLineHeight: () => ({ commands }) => this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight')),
    }
  },
})

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

const Icons = {
  bold: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  italic: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  underline: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
  strikethrough: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2m8.2 3.7c.3.4.4.8.4 1.3 0 2.9-2.7 3.6-6.2 3.6-2.3 0-4.4-.3-6.2-.9M4 11.5h16"/></svg>,
  alignLeft: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
  alignCenter: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>,
  alignRight: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>,
  alignJustify: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>,
  bulletList: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>,
  orderedList: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="7" fontSize="6" fill="currentColor">1</text><text x="3" y="13" fontSize="6" fill="currentColor">2</text><text x="3" y="19" fontSize="6" fill="currentColor">3</text></svg>,
  undo: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>,
  redo: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>,
  link: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  image: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  table: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  quote: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>,
  code: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  horizontalRule: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  clearFormat: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><path d="M5 19l14-14"/></svg>,
  subscript: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M16 19h4v1h-5v-1l2.5-2.5c.5-.5.8-1 .8-1.5s-.3-1-.8-1c-.5 0-.8.3-1 .8l-1-.4c.2-.9 1-1.4 2-1.4 1.1 0 2 .8 2 1.8s-.4 1.4-1 2l-1.5 1.2zM5.41 5l4.59 4.59 4.59-4.59 1.41 1.41-4.59 4.59 4.59 4.59-1.41 1.41-4.59 4.59-4.59 4.59-1.41-1.41 4.59-4.59-4.59-4.59z"/></svg>,
  superscript: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M16 7h4v1h-5v-1l2.5-2.5c.5-.5.8-1 .8-1.5s-.3-1-.8-1c-.5 0-.8.3-1 .8l-1-.4c.2-.9 1-1.4 2-1.4 1.1 0 2 .8 2 1.8s-.4 1.4-1 2l-1.5 1.2zM5.41 5l4.59 4.59 4.59-4.59 1.41 1.41-4.59 4.59 4.59 4.59-1.41 1.41-4.59 4.59-4.59 4.59-1.41-1.41 4.59-4.59-4.59-4.59z"/></svg>,
  save: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  menu: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevronDown: <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  back: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Tahoma', label: 'Tahoma' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Impact', label: 'Impact' },
]

const fontSizes = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px']
const textColors = ['#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC', '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF', '#980000', '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#4A86E8', '#0000FF', '#9900FF', '#FF00FF', '#E6B8AF', '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#C9DAF8', '#CFE2F3', '#D9D2E9', '#EAD1DC']

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function CreatePostClient({ userId, profile }: { userId: string, profile: any }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'format'>('home')
  
  // Dropdowns state
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [showSizeDropdown, setShowSizeDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  
  // Image Crop state
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
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CustomImage,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
      Placeholder.configure({ placeholder: '' }),
      FontFamily.configure({ types: ['textStyle'] }),
      FontSize,
      LineHeight,
      Subscript,
      Superscript,
      CharacterCount,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[1056px] px-8 py-10',
        style: 'min-height: 1056px;'
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.[0]) {
          handleFileSelect(event.dataTransfer.files[0])
          return true
        }
        return false
      },
    },
  })

  // Handlers
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return showToast("Only image files allowed!", "error")
    if (file.size > 5 * 1024 * 1024) return showToast("Max 5MB!", "error")
    setCurrentFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setOriginalImage(reader.result as string)
      setCrop(undefined)
      setCompletedCrop(undefined)
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

    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      if (!blob) { showToast("Failed to process image", "error"); setLoading(false); return }
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
      try {
        const { error: uploadError } = await supabase.storage.from('avatars').upload(`thumbnails/${fileName}`, blob)
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(`thumbnails/${fileName}`)
        editor.chain().focus().setImage({ src: publicUrl }).run()
        showToast("Image added!", "success")
        setCropModalOpen(false); setOriginalImage(null); setCurrentFile(null)
      } catch (error) { showToast("Upload failed", "error") } finally { setLoading(false) }
    }, 'image/jpeg', 0.9)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    handleFileSelect(e.target.files[0])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!title.trim()) return showToast("Title required!", "error")
    if (!editor) return
    
    // Cek konten kosong
    const content = editor.getHTML()
    if (!content || content === '<p></p>') return showToast("Content cannot be empty!", "error")

    setLoading(true)
    try {
      const result = await createPost(title, content)
      if (result.success) { 
        showToast("Published!", "success")
        router.push('/dashboard') 
      }
      else { 
        showToast(result.error || "Failed", "error") 
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

  const insertTable = () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  
  const closeAllDropdowns = () => {
    setShowFontDropdown(false); setShowSizeDropdown(false); setShowColorDropdown(false)
  }

  const wordCount = editor?.storage.characterCount.words() || 0
  const charCount = editor?.storage.characterCount.characters() || 0

  if (!editor) return <div className="fixed inset-0 flex items-center justify-center bg-[#F3F2F1]"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>

  const ToolbarButton = ({ onClick, active = false, disabled = false, children, title }: any) => (
    <button onClick={onClick} disabled={disabled} title={title} className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${active ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{children}</button>
  )
  const Divider = () => <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-[#F3F2F1] dark:bg-[#1b1b1b] z-[9999]" onClick={closeAllDropdowns}>
      
      {/* MODAL CROP */}
      {cropModalOpen && originalImage && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
             <h3 className="font-bold mb-4 text-black">Crop Image</h3>
             <div className="bg-gray-100 flex justify-center p-2 rounded-lg"><ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop}><img ref={imageRef} src={originalImage} alt="Crop" style={{ maxHeight: '50vh' }} onLoad={onImageLoad}/></ReactCrop></div>
             <div className="flex justify-end gap-2 mt-4"><button onClick={() => { setCropModalOpen(false); setOriginalImage(null) }} className="px-4 py-2 rounded bg-gray-200 text-black">Cancel</button><button onClick={processAndUpload} disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">Upload</button></div>
          </div>
        </div>
      )}

      {/* MODAL LINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="font-bold mb-4 text-black">Insert Link</h3>
            <input type="url" placeholder="https://" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4 text-black" autoFocus />
            <div className="flex justify-end gap-2"><button onClick={() => setShowLinkModal(false)} className="px-4 py-2 rounded bg-gray-200 text-black">Cancel</button><button onClick={setLink} className="px-4 py-2 rounded bg-blue-600 text-white">Insert</button></div>
          </div>
        </div>
      )}

      {/* === HEADER (FIXED TOP) === */}
      <header className="flex-none bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 bg-[#2B579A] text-white">
          
          {/* Left Side: Back & Title (Flexible but prevented from crushing right side) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button onClick={() => router.back()} className="p-1 hover:bg-white/20 rounded-full shrink-0">{Icons.back}</button>
            <input type="text" placeholder="Document Name" value={title} onChange={(e) => setTitle(e.target.value)} className="font-medium text-base sm:text-lg bg-transparent outline-none placeholder-blue-200 text-white flex-1 min-w-0" />
          </div>

          {/* Right Side: Buttons (Fixed width / Shrink 0) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
             <button 
                onClick={handleSubmit} 
                disabled={loading || !title.trim()} 
                className="bg-white text-[#2B579A] px-2 sm:px-4 py-1.5 text-sm font-bold rounded shadow hover:bg-gray-100 flex items-center gap-1 sm:gap-2"
             >
                {Icons.save} 
                <span className="hidden sm:inline">{loading ? 'Saving...' : 'Share'}</span>
             </button>
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-white/20 rounded lg:hidden">{mobileMenuOpen ? Icons.close : Icons.menu}</button>
          </div>
        </div>

        {/* TABS (Desktop Only) */}
        <div className="hidden lg:flex items-center px-2 pt-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
           {['home', 'insert', 'format'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === tab ? 'text-[#2B579A] border-[#2B579A] bg-gray-100 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-50 dark:hover:bg-gray-600'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
           ))}
        </div>

        {/* TOOLBAR (Desktop Only) */}
        <div className={`hidden lg:block bg-[#F9F9F9] dark:bg-gray-900 py-2 px-4 shadow-inner border-b border-gray-200 dark:border-gray-700`}>
          <div className="flex flex-wrap items-center gap-1 h-full">
            {activeTab === 'home' && (
              <>
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">{Icons.undo}</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">{Icons.redo}</ToolbarButton>
                <Divider />
                
                {/* FONT FAMILY DROPDOWN */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setShowFontDropdown(!showFontDropdown); setShowSizeDropdown(false); setShowColorDropdown(false) }} className="flex items-center gap-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 w-36 justify-between text-black dark:text-white">
                    <span className="truncate">{editor.getAttributes('textStyle').fontFamily || 'Arial'}</span>{Icons.chevronDown}
                  </button>
                  {showFontDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-xl z-50 max-h-60 overflow-auto w-40 rounded-sm">
                      {fontFamilies.map(f => (
                        <button key={f.value} onClick={() => { editor.chain().focus().setFontFamily(f.value).run(); setShowFontDropdown(false) }} 
                          className="block w-full text-left px-3 py-1.5 hover:bg-blue-100 dark:hover:bg-gray-700 text-sm text-black dark:text-white" 
                          style={{fontFamily: f.value}}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* FONT SIZE DROPDOWN */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setShowSizeDropdown(!showSizeDropdown); setShowFontDropdown(false); setShowColorDropdown(false) }} className="flex items-center gap-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 w-16 justify-between text-black dark:text-white">
                    <span>{editor.getAttributes('textStyle').fontSize?.replace('px', '') || '16'}</span>{Icons.chevronDown}
                  </button>
                  {showSizeDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-xl z-50 max-h-60 overflow-auto w-16 rounded-sm">
                      {fontSizes.map(s => (
                        <button key={s} onClick={() => { editor.chain().focus().setFontSize(s).run(); setShowSizeDropdown(false) }} className="block w-full text-left px-2 py-1 hover:bg-blue-100 dark:hover:bg-gray-700 text-sm text-black dark:text-white">
                          {s.replace('px','')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <Divider />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>{Icons.bold}</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>{Icons.italic}</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>{Icons.underline}</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>{Icons.strikethrough}</ToolbarButton>
                <Divider />
                
                {/* COLOR PICKER */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setShowColorDropdown(!showColorDropdown); setShowFontDropdown(false); setShowSizeDropdown(false) }} className="flex flex-col items-center justify-center p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 w-8 h-8 text-black dark:text-white">
                      <span className="font-bold text-sm leading-none">A</span><span className="w-5 h-1 mt-0.5" style={{backgroundColor: editor.getAttributes('textStyle').color || 'black'}}></span>
                    </button>
                    {showColorDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 p-2 shadow-xl z-50 w-48 grid grid-cols-5 gap-1 rounded-sm">
                        {textColors.map(c => <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorDropdown(false) }} className="w-6 h-6 border border-gray-200 hover:scale-110 shadow-sm" style={{backgroundColor: c}} />)}
                      </div>
                    )}
                </div>
                
                <Divider />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>{Icons.alignLeft}</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>{Icons.alignCenter}</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>{Icons.alignRight}</ToolbarButton>
                <Divider />
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>{Icons.bulletList}</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>{Icons.orderedList}</ToolbarButton>
              </>
            )}
            {activeTab === 'insert' && (
              <>
                <ToolbarButton onClick={() => fileInputRef.current?.click()}><div className="flex flex-col items-center gap-1">{Icons.image}<span className="text-[10px]">Image</span></div></ToolbarButton>
                <ToolbarButton onClick={() => setShowLinkModal(true)}><div className="flex flex-col items-center gap-1">{Icons.link}<span className="text-[10px]">Link</span></div></ToolbarButton>
                <ToolbarButton onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><div className="flex flex-col items-center gap-1">{Icons.table}<span className="text-[10px]">Table</span></div></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}><div className="flex flex-col items-center gap-1">{Icons.quote}<span className="text-[10px]">Quote</span></div></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}><div className="flex flex-col items-center gap-1">{Icons.horizontalRule}<span className="text-[10px]">Divider</span></div></ToolbarButton>
              </>
            )}
          </div>
        </div>

        {/* MOBILE TOOLBAR (Responsive) */}
        <div className={`lg:hidden bg-gray-50 border-b border-gray-200 overflow-x-auto whitespace-nowrap p-2 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
           <div className="flex gap-2">
              <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>{Icons.bold}</ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>{Icons.italic}</ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({textAlign:'left'})}>{Icons.alignLeft}</ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({textAlign:'center'})}>{Icons.alignCenter}</ToolbarButton>
              <ToolbarButton onClick={() => fileInputRef.current?.click()}>{Icons.image}</ToolbarButton>
              <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>{Icons.undo}</ToolbarButton>
           </div>
        </div>
      </header>
      
      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleInputChange} />

      {/* === MIDDLE AREA (SCROLLABLE) === */}
      {/* flex-1 ensures it takes all remaining space. Relative + overflow-hidden keeps scrollbar inside. */}
      <main className="flex-1 relative overflow-hidden bg-[#F3F2F1] dark:bg-[#1b1b1b]">
        <div className="absolute inset-0 overflow-y-auto flex justify-center p-4 sm:p-8" onClick={() => editor.chain().focus().run()}>
          {/* THE PAPER */}
          <div 
             className="bg-white shadow-2xl w-full lg:w-[210mm] text-black transition-all mb-8"
             style={{ maxWidth: '816px', minHeight: '1056px', height: 'fit-content' }}
          >
            <EditorContent editor={editor} className="prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none" />
          </div>
        </div>
      </main>

      {/* === FOOTER (FIXED BOTTOM) === */}
      <footer className="flex-none bg-[#2B579A] dark:bg-gray-900 text-white text-xs px-4 py-1.5 flex justify-between items-center z-40 border-t border-blue-800 dark:border-gray-700">
        <div className="flex gap-4">
           <span>Page 1 of 1</span>
           <span>{wordCount} words</span>
           <span className="hidden sm:inline">{charCount} characters</span>
        </div>
        <div className="flex gap-4">
           <span>English (US)</span>
           <span>100%</span>
        </div>
      </footer>
    </div>
  )
}