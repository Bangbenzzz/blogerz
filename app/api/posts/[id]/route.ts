import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

// Helper untuk Auth
async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  return supabase.auth.getUser()
}

// GET: Ambil detail post untuk diedit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: { user } } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // WAJIB: Await params di Next.js 15
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, title: true, content: true, imageUrl: true, authorId: true }
    })

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.authorId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json(post)
  } catch (error) {
    console.error("GET Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT: Simpan perubahan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: { user } } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // WAJIB: Await params
    const { id } = await params
    
    const body = await request.json()
    const { title, content, imageUrl } = body

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!existingPost || existingPost.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { title, content, imageUrl }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("PUT Error:", error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE: Hapus post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { data: { user } } = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // WAJIB: Await params
    const { id } = await params

    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!existingPost || existingPost.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.post.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE Error:", error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}