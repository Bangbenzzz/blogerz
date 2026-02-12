import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import styles from './dashboard.module.css'
import ClientPostList from './ClientPostList'
import ProfileEditor from './ProfileEditor'
import UserMenu from '@/components/UserMenu'
import UserSearch from '@/components/UserSearch'
import OnboardingModal from '@/components/OnboardingModal'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  const myPosts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className={styles.container}>
      
      <OnboardingModal profile={profile} />

      <header className={styles.header}>
        <div className={styles.title}>
          <h1>Dashboard</h1>
        </div>
        
        <div className={styles.headerActions}>
          
          <UserSearch />

          <Link href="/" className={styles.btnBack}>
            Home
          </Link>
          
          <Link href="/dashboard/write" className={styles.btnNew}>
            + Baru
          </Link>
          
          {/* USER MENU */}
          <div className={styles.userMenuContainer}>
             <UserMenu userEmail={user.email} avatarUrl={profile?.avatarUrl} />
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <section>
           <ProfileEditor profile={profile} userEmail={user.email} />
        </section>

        <div className={styles.sectionTitle}>
           ARSIP TULISAN ({myPosts.length})
        </div>
        
        <ClientPostList initialPosts={myPosts} />
      </main>
    </div>
  )
}