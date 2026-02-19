'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ==================== AUTH HELPER ====================
async function getCurrentUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  return await supabase.auth.getUser()
}

// ==================== SEARCH USERS ====================
export async function searchUsers(query: string) {
  try {
    const users = await prisma.profile.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true
      },
      take: 10
    })
    
    return users
  } catch (error) {
    console.error('Search users error:', error)
    return []
  }
}

// ==================== CREATE POST (UPDATE: DENGAN GAMBAR) ====================
export async function createPost(title: string, content: string, imageUrl?: string | null) {
  try {
    const { data: { user } } = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
        published: false,
        imageUrl: imageUrl // Tambahkan field imageUrl
      },
      include: {
        author: true
      }
    })

    revalidatePath('/')
    return { success: true, post, message: 'Karya berhasil dikirim!' }
  } catch (error) {
    console.error('Create post error:', error)
    return { success: false, error: 'Failed to create post' }
  }
}

// ==================== TOGGLE LIKE ====================
export async function toggleLike(postId: string) {
  try {
    const { data: { user } } = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        authorId: user.id
      }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
    } else {
      await prisma.like.create({
        data: {
          postId,
          authorId: user.id
        }
      })
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Toggle like error:', error)
    return { success: false, error: 'Failed to toggle like' }
  }
}

// ==================== POST COMMENT ====================
export async function postComment(postId: string, content: string) {
  try {
    const { data: { user } } = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id
      },
      include: {
        author: true
      }
    })

    revalidatePath('/')
    return { success: true, comment }
  } catch (error) {
    console.error('Post comment error:', error)
    return { success: false, error: 'Failed to post comment' }
  }
}

// ==================== DELETE COMMENT ====================
export async function deleteComment(commentId: string) {
  try {
    const { data: { user } } = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true }
    })

    if (!comment) {
      return { success: false, error: 'Comment not found' }
    }

    // ✅ PERBAIKAN: Deteksi admin yang lebih kuat & anti-gagal
    const userEmail = user.email?.trim().toLowerCase()
    const isAdmin = 
      userEmail === 'admin@bloger.com' || 
      userEmail === process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
      userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();

    // Jika yang mau hapus BUKAN pemilik komentar dan BUKAN admin, maka tolak!
    if (comment.authorId !== user.id && !isAdmin) {
      return { success: false, error: 'Ditolak: Anda bukan Admin atau Pemilik Komentar' }
    }

    await prisma.comment.delete({
      where: { id: commentId }
    })

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Delete comment error:', error)
    return { success: false, error: 'Failed to delete comment' }
  }
}

// ==================== ADMIN ACTIONS ====================

export async function approvePost(postId: string) {
  try {
    const { data: { user } } = await getCurrentUser()
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.post.update({
      where: { id: postId },
      data: { published: true }
    })
    
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to approve post' }
  }
}

export async function deletePost(postId: string) {
  try {
    const { data: { user } } = await getCurrentUser()
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.post.delete({
      where: { id: postId }
    })
    
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete post' }
  }
}

export async function toggleBanUser(userId: string, isBanned: boolean) {
  const { data: { user } } = await getCurrentUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized' }
  }

  await prisma.profile.update({
    where: { id: userId },
    data: { isBanned }
  })

  return { success: true }
}

export async function changeUserRole(userId: string, role: 'USER' | 'ADMIN') {
  const { data: { user } } = await getCurrentUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized' }
  }

  await prisma.profile.update({
    where: { id: userId },
    data: { role }
  })

  return { success: true }
}

export async function toggleVerified(userId: string, isVerified: boolean) {
  const { data: { user } } = await getCurrentUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized' }
  }

  await prisma.profile.update({
    where: { id: userId },
    data: { isVerified }
  })

  return { success: true }
}

export async function adminComment(postId: string, content: string) {
  const { data: { user } } = await getCurrentUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!content.trim()) {
    return { success: false, error: 'Comment cannot be empty' }
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: user.id
    }
  })
  
  revalidatePath('/admin')
  return { success: true }
}