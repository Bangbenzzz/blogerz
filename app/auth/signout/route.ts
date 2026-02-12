// app/auth/signout/route.ts

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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

  // Cek jika session ada, lalu proses logout (menghapus cookie/sesi)
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    await supabase.auth.signOut()
  }

  // Redirect kembali ke halaman utama setelah berhasil keluar
  return NextResponse.redirect(new URL('/', request.url), {
    status: 302,
  })
}