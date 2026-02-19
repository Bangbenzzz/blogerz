import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import AdminProfileEditor from './AdminProfileEditor'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function AdminProfilePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="h-screen bg-[var(--bg-main)] flex items-center justify-center text-red-500 font-mono text-xl p-4 text-center">
        <h1>[ ACCESS_DENIED ]</h1>
      </div>
    )
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] font-sans pt-20 pb-10">
      
      {/* Header */}
      <header className="sticky top-0 z-50 flex flex-col md:flex-row justify-between items-start md:items-center py-4 px-4 md:px-[10%] bg-[var(--bg-main)] backdrop-blur-xl border-b border-white/10 mb-8 gap-4">
        <div className="flex flex-col gap-1">
          {/* Warna teks Biru */}
          <span className="text-[#3B82F6] font-mono text-[10px] tracking-widest uppercase">
            // ADMIN_PROFILE
          </span>
          <h1 className="text-xl font-extrabold uppercase tracking-tight m-0">
            👤 MY PROFILE
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto">
            {/* Hover Border Biru */}
            <Link href="/admin" className="py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all whitespace-nowrap">📝 Posts</Link>
            <Link href="/admin/users" className="py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all whitespace-nowrap">👥 Users</Link>
            <Link href="/admin/dashboard" className="py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-all whitespace-nowrap">🏠 Dashboard</Link>
            {/* Active Link Biru */}
            <Link href="/admin/profile" className="py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider border border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6]/10 whitespace-nowrap">👤 Profile</Link>
          </div>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <ThemeToggle />
          </div>

          <form action="/auth/signout" method="post">
            <button type="submit" className="bg-red-500/5 border border-red-500 text-red-500 py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-red-500 hover:text-black transition-all">Exit_</button>
          </form>
        </div>
      </header>

      {/* Profile Content */}
      <div className="px-4 md:px-[10%] max-w-2xl">
        <AdminProfileEditor profile={profile} userEmail={user.email || ''} />
      </div>
    </div>
  )
}