// app/register/actions.ts
'use server'

import prisma from '@/lib/prisma'

export async function syncUserToPrisma(id: string, email: string, name: string) {
  const isAdmin = email === process.env.ADMIN_EMAIL

  // Simpan data user baru ke database Prisma
  await prisma.profile.upsert({
    where: { email },
    update: { name },
    create: {
      id,
      email,
      name,
      role: isAdmin ? 'ADMIN' : 'USER',
    }
  })
}