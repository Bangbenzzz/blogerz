// app/actions.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// --- 1. FITUR LIKE ---
export async function toggleLike(postId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Login dulu bro!" }

  const existingLike = await prisma.like.findUnique({
    where: { postId_authorId: { postId, authorId: user.id } }
  })

  if (existingLike) {
    await prisma.like.delete({ where: { id: existingLike.id } })
  } else {
    await prisma.like.create({ data: { postId, authorId: user.id } })
  }

  revalidatePath('/') 
  return { success: true }
}

// --- 2. FITUR KOMENTAR ---
export async function postComment(postId: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Login dulu bro!" }

  const content = formData.get('content') as string
  if (!content || content.trim() === '') return

  await prisma.comment.create({
    data: { content, postId, authorId: user.id }
  })

  revalidatePath('/')
  return { success: true }
}

// --- 3. FITUR PENCARIAN (VERSI BEBAS - SEMUA MUNCUL) ---
export async function searchUsers(query: string) {
  // Minimal 1 huruf biar responsif cari namanya
  if (!query || query.length < 1) return [] 

  try {
    const users = await prisma.profile.findMany({
      where: {
        // Cukup cek apakah NAMA atau USERNAME cocok
        // Kita HAPUS syarat username tidak boleh null/kosong
        // Supaya user baru (yang belum set username) tetap bisa dicari
        OR: [
          { name: { contains: query, mode: 'insensitive' } }, 
          { username: { contains: query, mode: 'insensitive' } } 
        ]
      },
      take: 5, 
      select: {
        id: true,
        name: true,
        username: true, // Walaupun null tetap diambil
        avatarUrl: true
      }
    })

    return users

  } catch (error) {
    console.error("❌ ERROR PENCARIAN:", error)
    return []
  }
}

// --- 4. FITUR HAPUS KOMENTAR (BARU DITAMBAHKAN) ---
export async function deleteComment(commentId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Login dulu bro!" }

  try {
    // Kita gunakan deleteMany dengan filter authorId
    // Ini PENTING agar user tidak bisa menghapus komentar orang lain (Security)
    const result = await prisma.comment.deleteMany({
      where: { 
        id: commentId,
        authorId: user.id // Hanya hapus jika ID cocok DAN Author-nya adalah user yg login
      }
    })

    if (result.count === 0) {
      return { error: "Gagal hapus. Ini bukan komentar kamu." }
    }

    revalidatePath('/') // Refresh halaman
    return { success: true }

  } catch (error) {
    console.error("Error deleting comment:", error)
    return { error: "Terjadi kesalahan server" }
  }
}