import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

// GET: Ambil semua partner
export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(partners)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

// POST: Tambah partner baru
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Cek Admin
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, logoUrl, order } = await request.json()

    if (!name || !logoUrl) {
      return NextResponse.json({ error: 'Name and Logo URL are required' }, { status: 400 })
    }

    const partner = await prisma.partner.create({
      data: { name, logoUrl, order: order || 0 }
    })

    return NextResponse.json(partner)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
  }
}

// DELETE: Hapus partner
export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    
    await prisma.partner.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 })
  }
}