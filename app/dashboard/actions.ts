'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. FUNGSI HAPUS POST
export async function deleteMyPost(postId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await prisma.post.deleteMany({
    where: { id: postId, authorId: user.id }
  })

  revalidatePath('/dashboard')
  return { success: true }
}

// 2. FUNGSI UPDATE PROFIL
export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const bio = formData.get('bio') as string
  const avatarUrl = formData.get('avatarUrl') as string

  try {
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        name,
        username,
        bio,
        ...(avatarUrl && { avatarUrl })
      },
      create: {
        id: user.id,
        email: user.email!,
        name,
        username,
        bio,
        avatarUrl,
        role: 'USER'
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    if (error.code === 'P2002') {
        return { error: 'Username sudah dipakai.' }
    }
    throw error
  }
}

// 3. FUNGSI HAPUS FOTO
export async function deleteProfilePhoto() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  try {
    await prisma.profile.update({
        where: { id: user.id },
        data: { avatarUrl: null }
    })
  } catch (e) {
      // Ignore
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

// 4. FUNGSI ONBOARDING
export async function completeOnboarding(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const username = formData.get('username') as string
  const name = formData.get('name') as string

  if (!username || username.length < 3) {
    return { error: "Username minimal 3 karakter bro!" }
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { error: "Username cuma boleh huruf, angka, dan garis bawah (_)" }
  }

  try {
    const existingUser = await prisma.profile.findUnique({ where: { username } })
    if (existingUser && existingUser.id !== user.id) {
      return { error: "Yah, Username itu sudah dipakai orang lain. Cari yang lain!" }
    }

    await prisma.profile.upsert({
      where: { id: user.id },
      update: { username, name: name || 'User Baru' },
      create: {
        id: user.id,
        email: user.email!,
        username,
        name: name || 'User Baru',
        role: 'USER',
        createdAt: new Date(),
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/') 
    return { success: true }

  } catch (e) {
    console.error("Error onboarding:", e)
    return { error: "Gagal menyimpan. Coba lagi nanti." }
  }
}