'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Fungsi bantuan untuk cek apakah yang klik benar-benar Admin
async function checkAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === process.env.ADMIN_EMAIL
}

// FUNGSI APPROVE
export async function approvePost(postId: string) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Unauthorized")

  await prisma.post.update({
    where: { id: postId },
    data: { published: true }
  })

  // Refresh halaman admin agar status berubah otomatis
  revalidatePath('/admin')
  revalidatePath('/') // Refresh halaman depan juga
}

// FUNGSI DELETE
export async function deletePost(postId: string) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Unauthorized")

  await prisma.post.delete({
    where: { id: postId }
  })

  revalidatePath('/admin')
  revalidatePath('/')
}