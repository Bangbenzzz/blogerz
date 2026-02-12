'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Submit Artikel Baru
export async function submitNewPost(title: string, content: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Generate Slug Unik (Judul + Random String)
  // KARENA DB SUDAH RESET, KITA BISA PAKAI INI SEKARANG TANPA ERROR
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Ganti simbol jadi strip
    .replace(/^-+|-+$/g, '')     // Hapus strip di awal/akhir
    + '-' + Math.random().toString(36).substring(2, 7) // Tambah random string biar unik

  await prisma.post.create({
    data: {
      title,
      content,
      slug, 
      authorId: user.id,
      published: false, // Default Draft
    }
  })

  revalidatePath('/dashboard')
  return { success: true }
}

// 2. Ambil Artikel Lama (Untuk Edit)
export async function getPostById(postId: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const post = await prisma.post.findUnique({
    where: { id: postId }
  })

  // Security: Pastikan yang edit adalah pemiliknya
  if (post && post.authorId === user.id) {
    return post
  }
  return null
}

// 3. Update Artikel Lama
export async function updatePost(postId: string, title: string, content: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await prisma.post.updateMany({
    where: { 
      id: postId,
      authorId: user.id 
    },
    data: {
      title,
      content,
      published: false // Reset ke draft biar direview ulang (Opsional)
    }
  })

  revalidatePath('/dashboard')
  return { success: true }
}