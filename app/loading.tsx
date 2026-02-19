export default function Loading() {
  return (
    // Menggunakan var(--bg-main) agar background otomatis berubah sesuai tema
    <div className="flex h-[100dvh] w-full items-center justify-center bg-[var(--bg-main)]">
      
      {/* Menggunakan warna biru utama Anda (#3B82F6) agar spinner terlihat jelas 
        baik di background gelap maupun terang.
      */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin text-[#3B82F6]" 
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="3" 
          className="opacity-20" 
        />
        <path 
          d="M12 2a10 10 0 0 1 10 10" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />
      </svg>

    </div>
  );
}