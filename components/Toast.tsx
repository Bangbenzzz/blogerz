'use client'

import { useState, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

// --- FUNGSI GLOBAL UNTUK DIPANGGIL DARI MANA SAJA ---
export const showToast = (message: string, type: ToastType = 'success') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app-toast', {
        detail: { message, type },
      })
    )
  }
}

export default function Toast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleToastEvent = (e: CustomEvent) => {
      const { message, type } = e.detail
      
      setToast({ message, type })
      setIsVisible(false)
      
      setTimeout(() => setIsVisible(true), 10)

      setTimeout(() => {
        setIsVisible(false)
      }, 3000)
      
      setTimeout(() => {
        setToast(null)
      }, 3300)
    }

    window.addEventListener('app-toast', handleToastEvent as EventListener)

    return () => {
      window.removeEventListener('app-toast', handleToastEvent as EventListener)
    }
  }, [])

  if (!toast) return null

  let borderColor = '#00ff41'
  let shadowColor = 'rgba(0, 255, 65, 0.4)'

  if (toast.type === 'error') {
    borderColor = '#ff0033'
    shadowColor = 'rgba(255, 0, 51, 0.4)'
  } else if (toast.type === 'info') {
    borderColor = '#00d2ff'
    shadowColor = 'rgba(0, 210, 255, 0.4)'
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '25px',
        left: '50%',
        transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, -150%)',
        opacity: isVisible ? 1 : 0,
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: '#000000',
        border: `1px solid ${borderColor}`,
        color: borderColor,
        padding: '8px 16px', 
        borderRadius: '999px',
        boxShadow: `0 0 15px ${shadowColor}, 0 5px 10px rgba(0,0,0,0.5)`,
        fontSize: '13px',
        fontWeight: 'bold',
        fontFamily: 'monospace, sans-serif',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
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
      </div>
      <span style={{ color: '#fff' }}>{toast.message}</span>
    </div>
  )
}