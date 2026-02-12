// app/dashboard/actions.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. FUNGSI HAPUS POST (Tetap sama)
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

// 2. FUNGSI UPDATE PROFIL (Untuk halaman Edit Profile)
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

  // Kita pakai UPSERT juga disini biar aman (jaga-jaga kalau data belum ada)
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
    // Tangkap error jika username sudah dipakai orang lain
    if (error.code === 'P2002') {
        return { error: 'Username sudah dipakai.' } // Tapi return type function ini beda, hati2 di frontend
    }
    throw error // Lempar error biar ditangkap catch di frontend
  }
}

// 3. FUNGSI HAPUS FOTO (Tetap sama)
export async function deleteProfilePhoto() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Kalau delete foto, pastikan usernya ada dulu
  // (Biasanya kalau delete foto pasti user lama, jadi update aman)
  try {
    await prisma.profile.update({
        where: { id: user.id },
        data: { avatarUrl: null }
    })
  } catch (e) {
      // Ignore kalau user gak ketemu
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

// 4. FUNGSI ONBOARDING (FIXED DISINI)
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

  // --- VALIDASI ---
  if (!username || username.length < 3) {
    return { error: "Username minimal 3 karakter bro!" }
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { error: "Username cuma boleh huruf, angka, dan garis bawah (_)" }
  }

  try {
    // Cek Username Kembar (Manual check biar pesan errornya enak)
    const existingUser = await prisma.profile.findUnique({
      where: { username }
    })

    // Jika username ada DAN bukan milik user yang sedang login -> Error
    if (existingUser && existingUser.id !== user.id) {
      return { error: "Yah, Username itu sudah dipakai orang lain. Cari yang lain!" }
    }

    // --- FIX UTAMA: GUNAKAN UPSERT ---
    // Jangan pakai update(), karena user baru belum punya baris data di tabel Profile
    await prisma.profile.upsert({
      where: { id: user.id }, // Cari user berdasarkan ID
      
      // JIKA DATA SUDAH ADA (User Lama ganti nama):
      update: { 
        username,
        name: name || 'User Baru' 
      },
      
      // JIKA DATA BELUM ADA (User Baru Login Pertama Kali):
      create: {
        id: user.id,
        email: user.email!, // Wajib ambil email dari Auth Supabase
        username,
        name: name || 'User Baru',
        role: 'USER', // Set role default
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