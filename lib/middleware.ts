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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Ambil User (Refresh session jika perlu)
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // =========================
  // ✅ CEK BANNED (tanpa Prisma)
  // =========================
  const bypassBannedCheck =
    pathname.startsWith('/banned') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'

  if (user && !bypassBannedCheck) {
    try {
      const bannedRes = await fetch(new URL('/api/auth/banned', request.url), {
        headers: {
          cookie: request.headers.get('cookie') ?? '',
        },
        cache: 'no-store',
      })

      const bannedData = await bannedRes.json()

      if (bannedData?.isBanned) {
        return NextResponse.redirect(new URL('/banned', request.url))
      }
    } catch (e) {
      console.error('middleware banned fetch error:', e)
      // fail-safe: kalau error jangan salah ban
    }
  }

  // 4. PROTEKSI HALAMAN ADMIN
  if (pathname.startsWith('/admin')) {
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 5. PROTEKSI HALAMAN MEMBER (Create, Settings, dll)
  const protectedPaths = ['/create', '/settings', '/profile/edit', '/dashboard']
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtectedPath) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
