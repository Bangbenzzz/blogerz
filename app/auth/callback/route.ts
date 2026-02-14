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

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session?.user) {
      const user = session.user
      const isAdmin = user.email === process.env.ADMIN_EMAIL
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || 'User'

      // Sync ke Prisma
      await prisma.profile.upsert({
        where: { id: user.id },
        update: {
          name: userName,
          role: isAdmin ? 'ADMIN' : 'USER',
          isVerified: isAdmin ? true : undefined,
        },
        create: {
          id: user.id,
          email: user.email!,
          name: userName,
          role: isAdmin ? 'ADMIN' : 'USER',
          isVerified: isAdmin ? true : false,
        }
      })

      // Redirect: Admin ke /admin, User ke /dashboard
      if (isAdmin) {
        return NextResponse.redirect(`${origin}/admin`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(origin)
}