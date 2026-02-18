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
    
    // Ambil data dari Body (termasuk kolom baru)
    const { 
      name, 
      username, 
      bio, 
      avatarUrl, 
      status, 
      institution, 
      major, 
      address, 
      phone 
    } = body

    // Logika Pembersihan Data:
    // Jika status adalah "Warga", paksa field akademik menjadi null 
    // agar database tidak menyimpan data sampah bekas pilihan sebelumnya.
    const isWarga = status === 'Warga'

    // Update atau Buat data profil baru
    await prisma.profile.upsert({
      where: { id: user.id },
      update: { 
        name, 
        username, 
        bio,
        // Update kolom baru
        status,
        institution: isWarga ? null : institution,
        major: isWarga ? null : major,
        address: isWarga ? null : address,
        phone: isWarga ? null : phone,
        
        // Hanya update avatar jika field avatarUrl dikirim (tidak undefined)
        ...(avatarUrl !== undefined && { avatarUrl }) 
      },
      create: {
        id: user.id,
        email: user.email!,
        name,
        username,
        bio,
        avatarUrl,
        // Isi kolom baru saat create
        status,
        institution: isWarga ? null : institution,
        major: isWarga ? null : major,
        address: isWarga ? null : address,
        phone: isWarga ? null : phone,
        
        role: 'USER',
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