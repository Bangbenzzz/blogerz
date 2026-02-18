import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { ThemeProvider } from '@/components/theme-provider'
import { redirect } from 'next/navigation'

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Proteksi: Jika bukan admin, tendang ke halaman utama
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  return (
    // Bungkus dengan ThemeProvider agar ThemeToggle berfungsi
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}