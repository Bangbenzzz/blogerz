import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import SettingsEditor from './SettingsEditor'
import DynamicLogo from '@/components/DynamicLogo'

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil data profile terbaru dari DB
  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-[1000] bg-[var(--bg-main)]/95 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            
            <DynamicLogo />

            <Link 
              href="/dashboard" 
              className="text-xs font-mono text-[var(--text-muted)] hover:text-[#3B82F6] transition-colors flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Kembali
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--text-main)] mb-2">
              Pengaturan Profil
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Sesuaikan identitas dan informasi akademik kamu di sini.
            </p>
          </div>

          <SettingsEditor profile={profile} userEmail={user.email || ''} />
        </div>
      </main>
    </div>
  )
}