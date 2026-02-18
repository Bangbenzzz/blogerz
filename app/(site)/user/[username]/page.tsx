// app/(site)/user/[username]/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import VerifiedBadge from "@/components/VerifiedBadge";

interface Props {
  params: Promise<{ username: string }>;
}

export const revalidate = 0;

export default async function UserProfilePage({ params }: Props) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { username } = await params;

  const profile = await prisma.profile.findFirst({
    where: { OR: [{ username }, { id: username }] },
  });

  if (!profile) notFound();

  const currentUserProfile = user
    ? await prisma.profile.findUnique({ where: { id: user.id } })
    : null;

  const isOwner = user?.id === profile.id;

  const posts = await prisma.post.findMany({
    where: {
      authorId: profile.id,
      ...(isOwner ? {} : { published: true }),
    },
    include: {
      author: true,
      likes: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalLikes = posts.reduce((acc, p) => acc + p.likes.length, 0);
  const totalComments = posts.reduce((acc, p) => acc + p.comments.length, 0);

  const getStatusLabel = (status: string | null) => {
    if (status === "Pelajar") return "Pelajar";
    if (status === "Mahasiswa") return "Mahasiswa";
    return "Warga";
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] pb-20">
      {/* kasih jarak agar konten profil tidak nempel header */}
      <main className="px-4 md:px-[5%] py-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[var(--border-color)] mx-auto mb-4 relative">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-5xl font-black text-white">
                      {profile.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-[var(--text-main)]">
                  {profile.name || "User"}
                </h1>
                {profile.isVerified && <VerifiedBadge size="lg" />}

                {isOwner && (
                  <Link
                    href="/settings"
                    className="p-1.5 rounded-full hover:bg-[var(--bg-main)] transition-colors"
                    title="Edit Profil"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </Link>
                )}
              </div>

              <p className="text-sm text-[var(--text-muted)] mb-2">
                @{profile.username || "username"}
              </p>

              {profile.status && (
                <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] font-bold border border-[#3B82F6]/20 text-xs">
                  {getStatusLabel(profile.status)}
                </span>
              )}
            </div>

            {profile.bio && (
              <div className="mb-6 text-center">
                <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* DETAIL: institusi / jurusan / wa / domisili */}
            <div className="border-t border-b border-[var(--border-color)] py-4 mb-6 space-y-3">
              {profile.institution && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#3B82F6]">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Institusi
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-main)]">
                      {profile.institution}
                    </p>
                  </div>
                </div>
              )}

              {profile.major && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Jurusan / Prodi
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-main)]">
                      {profile.major}
                    </p>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-500">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                    </svg>
                  </div>

                  <div className="flex-grow">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Whatsapp
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-main)]">{profile.phone}</p>
                  </div>

                  <a
                    href={`https://wa.me/${profile.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                  >
                    Hubungi
                  </a>
                </div>
              )}

              {profile.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Domisili
                    </p>
                    <p className="text-sm font-semibold text-[var(--text-main)]">{profile.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[var(--text-main)]">{posts.length}</p>
                <p className="text-xs text-[var(--text-muted)]">Karya</p>
              </div>
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[var(--text-main)]">{totalLikes}</p>
                <p className="text-xs text-[var(--text-muted)]">Likes</p>
              </div>
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-[var(--text-main)]">{totalComments}</p>
                <p className="text-xs text-[var(--text-muted)]">Komentar</p>
              </div>
            </div>
          </div>

          {/* KARYA */}
          {posts.length === 0 ? (
            <div className="text-center py-10 bg-[var(--bg-card)] rounded-xl border border-dashed border-[var(--border-color)]">
              <p className="text-[var(--text-muted)]">Belum ada karya yang dipublikasi.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {posts.map((post) => (
                <div key={post.id} className="relative">
                  {!post.published && isOwner && (
                    <div className="absolute top-2 right-2 z-10 px-3 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-600 text-[10px] font-bold rounded-full">
                      PENDING
                    </div>
                  )}

                  {post.published && (
                    <div className="absolute top-2 right-2 z-10 px-3 py-1 bg-green-500/20 border border-green-500 text-green-600 text-[10px] font-bold rounded-full">
                      PUBLISHED
                    </div>
                  )}

                  <PostCard post={post} currentUserId={user?.id} userEmail={user?.email} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
