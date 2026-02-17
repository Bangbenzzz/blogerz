'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
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
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useState } from 'react'

// --- Extensions Setup (Sama seperti sebelumnya) ---
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
          <div 
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-neutral-800 border border-neutral-600 shadow-2xl rounded-xl p-2 flex items-center gap-3 z-50 w-max"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Simplified Toolbar for Image */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Size:</span>
              <input type="range" min="10" max="100" value={parseInt(width)} onChange={handleResize} className="w-24 h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer" />
              <span className="text-xs text-neutral-300 w-10">{parseInt(width)}%</span>
            </div>
            <button type="button" onClick={deleteNode} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // Mencegah hydration mismatch
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline, 
      TextAlign.configure({ types: ['heading', 'paragraph'] }), 
      TextStyle, Color, 
      Highlight.configure({ multicolor: true }), 
      CustomImage, 
      Link, 
      Placeholder.configure({ placeholder: 'Tulis cerita menarik di sini...' }), 
      FontFamily, 
      FontSize, 
      CharacterCount
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'focus:outline-none min-h-[400px] text-lg leading-relaxed prose prose-invert max-w-none' },
    },
  })

  // Sinkronisasi konten jika berubah dari luar (misal saat fetch data edit)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
       editor.commands.setContent(content)
    }
  }, [content, editor])

  return <EditorContent editor={editor} />
}