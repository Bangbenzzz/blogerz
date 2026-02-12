import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // 1. Tukar kode otentikasi menjadi session resmi Supabase
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session?.user) {
      const user = session.user
      
      // 2. Cek apakah user ini adalah Admin
      const isAdmin = user.email === process.env.ADMIN_EMAIL

      // 3. Ambil nama dari Google/GitHub (kalau ada), kalau tidak ada pakai "Cyber User"
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || 'Cyber User'

      // 4. Sinkronisasi ke Database Prisma (Tabel Profile)
      // Upsert: Kalau emailnya sudah ada, update namanya. Kalau belum ada, buat record baru.
      await prisma.profile.upsert({
        where: { email: user.email! },
        update: {
          name: userName,
          role: isAdmin ? 'ADMIN' : 'USER',
        },
        create: {
          id: user.id, // Pakai ID dari Supabase agar sinkron
          email: user.email!,
          name: userName,
          role: isAdmin ? 'ADMIN' : 'USER',
        }
      })
    }
  }

  // 5. Setelah berhasil, arahkan user ke halaman utama '/'
  return NextResponse.redirect(origin)
}