import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const pendingPosts = await prisma.post.findMany({
      where: { published: false },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const count = await prisma.post.count({
      where: { published: false },
    })

    // ✅ NORMALIZE AUTHOR agar nama tidak pernah "kosong"
    const posts = pendingPosts.map((p) => {
      const rawName = (p.author?.name ?? '').trim()
      const rawUsername = (p.author?.username ?? '').trim().replace(/^@+/, '') // buang @ depan kalau ada

      const displayName = rawName || rawUsername || 'User'

      return {
        ...p,
        author: p.author
          ? {
              ...p.author,
              // paksa username tanpa "@"
              username: rawUsername || null,
              // paksa name tidak kosong (kalau kosong fallback ke username)
              name: displayName,
            }
          : {
              id: 'unknown',
              name: 'User',
              username: null,
              avatarUrl: null,
            },
      }
    })

    return NextResponse.json({ count, posts })
  } catch (error) {
    console.error('Error fetching pending posts:', error)
    return NextResponse.json({ count: 0, posts: [] }, { status: 500 })
  }
}
