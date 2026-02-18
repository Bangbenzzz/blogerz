'use client'

import { useEffect, useState } from 'react'

export default function ClientHTML({ html }: { html: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
