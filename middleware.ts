// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Buat response awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inisialisasi Supabase Client untuk Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookie di request agar bisa dibaca di server component selanjutnya
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Set cookie di response agar dikirim ke browser
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Ambil session user (PENTING: refresh token jika perlu)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. PROTEKSI ROUTE
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/admin') || 
                           request.nextUrl.pathname.startsWith('/create') ||
                           request.nextUrl.pathname.startsWith('/settings')

  // Jika User belum login & mengakses halaman yang dilindungi -> Redirect ke Login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    // Tambahkan pesan error jika perlu
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname) 
    return NextResponse.redirect(redirectUrl)
  }

  // Jika User sudah login & mengakses halaman login/register -> Redirect ke Dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 5. PERBAIKAN CACHE (Anti Cache untuk halaman dinamis)
  // Mencegah browser menyimpan halaman dashboard/login (agar tidak bisa di-back setelah logout)
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}