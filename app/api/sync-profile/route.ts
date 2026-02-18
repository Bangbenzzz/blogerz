import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json()

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 })
    }

    const isAdmin = email === process.env.ADMIN_EMAIL

    // --- LOGIKA AUTO USERNAME ---
    // Jika user baru, kita buat username default dari ID (dipotong 8 karakter pertama)
    // Ini memastikan user TIDAK PERNAH null username -> TIDAK ADA 404
    const defaultUsername = `user_${id.substring(0, 8)}`

    const profile = await prisma.profile.upsert({
      where: { id },
      update: {
        name,
        role: isAdmin ? 'ADMIN' : undefined,
        isVerified: isAdmin ? true : undefined,
        // Jangan update username jika sudah ada
      },
      create: {
        id,
        email,
        name,
        username: defaultUsername, // <--- INI KUNCI NYA
        role: isAdmin ? 'ADMIN' : 'USER',
        isVerified: isAdmin ? true : false,
      }
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Sync profile error:', error)
    return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 })
  }
}