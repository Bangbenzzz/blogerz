import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Buat response awal (Pengganti updateSession)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Inisialisasi Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update cookie di request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Buat response baru
          response = NextResponse.next({ request })
          // Set cookie di response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Ambil User (Refresh session jika perlu)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. PROTEKSI HALAMAN ADMIN
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Hanya boleh diakses jika login DAN email sesuai ADMIN_EMAIL
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 5. PROTEKSI HALAMAN MEMBER (Create, Settings, dll)
  // Daftar path yang wajib login
  const protectedPaths = ['/create', '/settings', '/profile/edit']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    if (!user) {
      // Jika belum login, tendang ke /login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Catatan: Cek Banned dilakukan di Server Component (page.tsx) 
    // untuk menghindari error Prisma di Edge Runtime.
  }

  return response
}

export const config = {
  matcher: [
    // Match semua path kecuali static files, api, dll
    '/((?!_next/static|_next/image|favicon.ico|auth|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}