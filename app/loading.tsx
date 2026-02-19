export default function Loading() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-neutral-900">
      
      {/* Ini adalah Spinner pengganti Geist! 
        - width & height = 40 (ukuran persis 40px seperti yang Anda mau)
        - text-white = membuatnya berwarna putih bersih
        - animate-spin = animasi berputar bawaan Tailwind
      */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin text-white"
      >
        {/* Lingkaran transparan di belakang */}
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="3" 
          className="opacity-20" 
        />
        {/* Garis putih solid yang berputar */}
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