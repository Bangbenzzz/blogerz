// components/ThemeToggle.tsx
'use client'

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Hindari Hydration Mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{width: 20, height: 20}} /> // Placeholder
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-main)',
        borderRadius: '20px',
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}