import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isBanned: false })
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { isBanned: true },
    })

    return NextResponse.json({ isBanned: Boolean(profile?.isBanned) })
  } catch (e) {
    console.error('banned check error:', e)
    // Fail-safe: jangan salah-ban. Kalau error, anggap tidak banned.
    return NextResponse.json({ isBanned: false }, { status: 200 })
  }
}
