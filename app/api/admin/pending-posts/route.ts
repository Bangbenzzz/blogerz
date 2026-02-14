import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const pendingPosts = await prisma.post.findMany({
      where: {
        published: false
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const count = await prisma.post.count({
      where: {
        published: false
      }
    })

    return NextResponse.json({
      count,
      posts: pendingPosts
    })
  } catch (error) {
    console.error('Error fetching pending posts:', error)
    return NextResponse.json({ count: 0, posts: [] }, { status: 500 })
  }
}