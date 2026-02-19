import Link from "next/link";
import DynamicLogo from "@/components/DynamicLogo";
import UserMenu from "@/components/UserMenu";
import UserSearch from "@/components/UserSearch";
import { ThemeToggle } from "@/components/ThemeToggle";

type UserLite = {
  id: string;
  email: string;
} | null;

type ProfileLite = {
  id: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
} | null;

export type SiteHeaderProps = {
  user: UserLite;
  profile: ProfileLite;
};

export default function SiteHeader({ user, profile }: SiteHeaderProps) {
  // ✅ Cek status admin untuk dikirimkan ke dalam UserMenu (Dropdown)
  const isUserAdmin = 
    user?.email === 'admin@bloger.com' || 
    user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    user?.email === process.env.ADMIN_EMAIL;

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-[1000]
        bg-[var(--bg-main)]
        border-b border-[var(--border-color)]
      "
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          <DynamicLogo />

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {user ? (
              <>
                {/* ❌ TOMBOL ADMIN DI LUAR SUDAH DIHAPUS ❌ */}

                {/* TOMBOL BUAT KARYA */}
                <Link
                  href="/create"
                  className="flex items-center justify-center gap-1.5 bg-[#3B82F6] text-white w-8 h-8 md:w-auto md:h-auto md:py-2 md:px-4 rounded-full hover:bg-[#2563EB] transition-all flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span className="hidden md:inline text-[11px] font-bold">Buat Karya</span>
                </Link>

                <UserSearch />

                {/* DROPDOWN MENU */}
                <UserMenu
                  userEmail={user.email}
                  avatarUrl={profile?.avatarUrl}
                  username={profile?.username}
                  name={profile?.name}
                  userId={profile?.id}
                  isAdmin={isUserAdmin} 
                />
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/login"
                  className="bg-[#3B82F6] border border-[#3B82F6] text-white py-1.5 px-4 md:py-2 md:px-5 text-[10px] md:text-[11px] font-extrabold uppercase rounded-full hover:bg-[#2563EB] hover:border-[#2563EB] transition-all whitespace-nowrap"
                >
                  Join Community
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}