// lib/middleware-utils.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Buat response awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. Update cookie di request object (untuk dibaca server selanjutnya)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // 2. Buat response baru jika belum ada (untuk dikirim ke browser)
          response = NextResponse.next({
            request,
          })
          
          // 3. Set cookie di response object
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Ambil user untuk memastikan session valid/refresh token
  await supabase.auth.getUser()

  return response
}