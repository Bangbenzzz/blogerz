// components/VerifiedBadge.tsx

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function VerifiedBadge({ size = 'md' }: VerifiedBadgeProps) {
  const sizePx = {
    sm: 14, // Sedikit diperkecil agar proporsional dengan teks
    md: 18,
    lg: 22
  }

  return (
    <img 
      src="/verified-badge.svg" 
      alt="Verified" 
      width={sizePx[size]}
      height={sizePx[size]}
      // Ditambahkan margin negatif ke kiri (-ml-0.5) agar lebih dekat dengan nama
      className="inline-block -ml-0.5" 
      style={{ width: sizePx[size], height: sizePx[size] }}
    />
  )
}