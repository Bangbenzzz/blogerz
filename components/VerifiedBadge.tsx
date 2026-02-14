// components/VerifiedBadge.tsx

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function VerifiedBadge({ size = 'md' }: VerifiedBadgeProps) {
  const sizePx = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <img 
      src="/verified-badge.svg" 
      alt="Verified" 
      width={sizePx[size]}
      height={sizePx[size]}
      className="inline-block"
      style={{ width: sizePx[size], height: sizePx[size] }}
    />
  )
}