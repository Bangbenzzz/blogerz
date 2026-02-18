import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/Toast";

// 👇 1. IMPORT TAMBAHAN YANG WAJIB ADA
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import BannedView from "@/components/BannedView"; // Pastikan file ini sudah dibuat seperti langkah sebelumnya

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cermati modern tech",
  description: "Platform kreatif untuk berbagi karya",
};

// 👇 2. WAJIB: Revalidate 0 agar status banned selalu dicek fresh (tidak dicache)
export const revalidate = 0;

// 👇 3. Ubah function menjadi ASYNC
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // === LOGIC PENGECEKAN BANNED ===
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Ambil user dari session Supabase
  const { data: { user } } = await supabase.auth.getUser();

  let isBanned = false;

  // Jika user login, cek status banned di database Prisma
  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { isBanned: true },
    });
    // Konversi ke boolean (jaga-jaga kalau null)
    isBanned = Boolean(profile?.isBanned);
  }
  // ================================

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Anti “flash light”: jalan sebelum React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var theme = localStorage.getItem('theme');
    // default: DARK
    if (!theme) theme = 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();
            `,
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* 👇 4. LOGIKA RENDERING UTAMA */}
          {/* Jika Banned = Tampilkan Layar Merah. Jika Tidak = Tampilkan Website */}
          {isBanned ? (
            <BannedView />
          ) : (
            <>
              {children}
              <ToastProvider />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}