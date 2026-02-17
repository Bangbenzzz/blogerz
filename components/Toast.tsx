'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
}

let showToastFn: (msg: string, type?: 'success' | 'error' | 'info') => void

export function ToastProvider() {
  const [toast, setToast] = useState<ToastProps | null>(null)

  useEffect(() => {
    showToastFn = (message, type = 'success') => {
      setToast({ message, type })
      setTimeout(() => setToast(null), 3000)
    }
  }, [])

  if (!toast) return null

  // Warna Border & Shadow
  let borderColor = '#3B82F6' // Biru (Default Success)
  let shadowColor = 'rgba(59, 130, 246, 0.4)'

  if (toast.type === 'error') {
    borderColor = '#ff0033' // Merah
    shadowColor = 'rgba(255, 0, 51, 0.4)'
  } else if (toast.type === 'info') {
    borderColor = '#00d2ff' // Cyan
    shadowColor = 'rgba(0, 210, 255, 0.4)'
  }

  return (
    // POSISI DIUBAH KE ATAS TENGAH
    <div 
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top fade-in duration-300"
    >
      <div 
        style={{
          background: '#000000',
          border: `1px solid ${borderColor}`,
          color: borderColor,
          padding: '8px 16px',
          borderRadius: '999px',
          boxShadow: `0 0 15px ${shadowColor}, 0 5px 10px rgba(0,0,0,0.5)`,
          fontSize: '13px',
          fontWeight: 'bold',
          fontFamily: 'monospace, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        {/* Ikon */}
        {toast.type === 'success' && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
        {toast.type === 'error' && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        )}
        {toast.type === 'info' && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        )}
        
        <span style={{ color: '#fff' }}>{toast.message}</span>
      </div>
    </div>
  )
}

export const showToast = (message: string, type?: 'success' | 'error' | 'info') => {
  if (showToastFn) showToastFn(message, type)
  else console.log('Toast:', message)
}