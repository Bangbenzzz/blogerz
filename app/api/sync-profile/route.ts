import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { id, email, name } = await request.json()

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing id or email' }, { status: 400 })
    }

    // Cek apakah admin
    const isAdmin = email === process.env.ADMIN_EMAIL

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { id },
      update: {
        name,
        role: isAdmin ? 'ADMIN' : undefined,
        isVerified: isAdmin ? true : undefined,
      },
      create: {
        id,
        email,
        name,
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