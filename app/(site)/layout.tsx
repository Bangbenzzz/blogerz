import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";

export const revalidate = 0;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.profile.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, username: true, avatarUrl: true, isBanned: true },
      })
    : null;

  // Kalau banned, kamu bisa redirect global di sini biar semua halaman langsung mental ke /banned
  // (kecuali /banned sendiri, tapi itu bisa kamu taruh di route group lain jika mau)
  // NOTE: redirect() tidak bisa di layout kalau kamu mau whitelist path tertentu.
  // Jadi untuk sekarang biarkan logic banned di page yang perlu.

  return (
    <div className="min-h-screen bg-transparent">
      <SiteHeader user={user ? { id: user.id, email: user.email ?? "" } : null} profile={profile} />

      {/* Biar konten tidak terlalu nempel ke header karena header sekarang FIXED */}
      <div className="pt-20 md:pt-24">
        {children}
      </div>
    </div>
  );
}