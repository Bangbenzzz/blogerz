/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Izinkan semua link dari supabase
      },
    ],
  },
};

export default nextConfig;