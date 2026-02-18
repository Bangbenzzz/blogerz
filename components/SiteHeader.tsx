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
  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-[1000]
        bg-[var(--bg-main)]
        border-b border-[var(--border-color)]
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          <DynamicLogo />

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {user ? (
              <>
                {user.email === process.env.ADMIN_EMAIL && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-500 py-2 px-4 text-[11px] font-bold rounded-full hover:bg-purple-500 hover:text-white transition-all"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  href="/create"
                  className="flex items-center gap-1.5 bg-[#3B82F6] text-white py-2 px-3 md:px-4 text-[11px] font-bold rounded-full hover:bg-[#2563EB] transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span className="hidden md:inline">Buat Karya</span>
                </Link>

                <UserSearch />

                <UserMenu
                  userEmail={user.email}
                  avatarUrl={profile?.avatarUrl}
                  username={profile?.username}
                  name={profile?.name}
                  userId={profile?.id}
                />
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  href="/login"
                  className="bg-[#3B82F6] border border-[#3B82F6] text-white py-2 px-5 text-[11px] font-extrabold uppercase rounded-full hover:bg-[#2563EB] hover:border-[#2563EB] transition-all whitespace-nowrap"
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