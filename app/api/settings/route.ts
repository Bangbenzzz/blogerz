import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

// --- HANDLER UNTUK UPDATE PROFIL (POST) ---
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Cek Login
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, username, bio, avatarUrl } = body

    // Update ke database
    await prisma.profile.upsert({
      where: { id: user.id },
      update: { 
        name, 
        username, 
        bio, 
        ...(avatarUrl && { avatarUrl }) // Hanya update avatar jika ada
      },
      create: {
        id: user.id,
        email: user.email!,
        name,
        username,
        bio,
        avatarUrl,
        role: 'USER', // Default role
        isVerified: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// --- HANDLER UNTUK HAPUS FOTO (DELETE) ---
export async function DELETE() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Set avatarUrl jadi null
    await prisma.profile.update({
      where: { id: user.id },
      data: { avatarUrl: null }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}