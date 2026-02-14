'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

async function getCurrentUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  return await supabase.auth.getUser()
}

export async function toggleBanUser(userId: string, isBanned: boolean) {
  const { data: { user } } = await getCurrentUser()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
  
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized')
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
    throw new Error('Unauthorized')
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
    throw new Error('Unauthorized')
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
    throw new Error('Unauthorized')
  }

  if (!content.trim()) {
    throw new Error('Comment cannot be empty')
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      authorId: user.id
    }
  })
}