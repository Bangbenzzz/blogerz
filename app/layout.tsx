import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/Toast";

// 👇 IMPORT FOOTER DISINI
import Footer from "@/components/Footer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import BannedView from "@/components/BannedView";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cermati modern tech",
  description: "Platform kreatif untuk berbagi karya",
};

export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
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

  const { data: { user } } = await supabase.auth.getUser();

  let isBanned = false;

  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { isBanned: true },
    });
    isBanned = Boolean(profile?.isBanned);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (!theme) theme = 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();
            `,
          }}
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {isBanned ? (
            <BannedView />
          ) : (
            /* 👇 TAMBAHKAN STRUKTUR FLEX DISINI 
               Agar footer selalu berada di dasar halaman (bottom)
            */
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                {children}
              </main>
              
              <Footer />
              <ToastProvider />
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}