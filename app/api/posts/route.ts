// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

// POST: Buat Artikel Baru
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, content } = await request.json()
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7)

    const post = await prisma.post.create({
      data: { title, content: content || '', slug, authorId: user.id, published: false }
    })

    return NextResponse.json(post)
  } catch (e) {
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 })
  }
}