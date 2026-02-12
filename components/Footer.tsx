// components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Bagian Kiri: Copyright */}
        <div className="footer-left">
          <p>&copy; 2026 Benz App. All rights reserved.</p>
        </div>

        {/* Bagian Kanan: Link Mahal */}
        <div className="footer-right">
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <span className="separator">•</span>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
          <span className="separator">•</span>
          <Link href="/contact" className="footer-link">Contact Support</Link>
        </div>

      </div>
    </footer>
  )
}