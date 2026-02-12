import "./globals.css";
// Menggunakan ../ karena folder components ada selangkah di luar folder app
import { ThemeProvider } from "../components/theme-provider"; 
import Toast from "../components/Toast"; // <--- 1. IMPORT TOAST

export const metadata = {
  title: "Cyber Blog",
  description: "Blog/Jurnal dengan moderasi admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {/* 2. PASANG TOAST DI SINI (Paling Atas) */}
          <Toast />
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}