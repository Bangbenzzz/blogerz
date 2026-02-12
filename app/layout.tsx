import "./globals.css";
import { ThemeProvider } from "../components/theme-provider"; 
import Toast from "../components/Toast"; 
import Footer from "../components/Footer"; 

export const metadata = {
  title: "Cyber Blog",
  description: "Blog/Jurnal dengan moderasi admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider>
          
          {/* --- WRAPPER UTAMA (Flexbox dipindah ke sini) --- */}
          {/* Ini menjamin layout tidak terputus oleh ThemeProvider */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh', /* Minimal setinggi layar */
          }}>
            
            {/* Toast tetap di atas */}
            <Toast />
            
            {/* Konten (Ambil sisa ruang) */}
            <div style={{ flex: 1, width: '100%' }}>
              {children}
            </div>

            {/* Footer (Akan terdorong ke bawah) */}
            <Footer />
            
          </div>
          
        </ThemeProvider>
      </body>
    </html>
  );
}