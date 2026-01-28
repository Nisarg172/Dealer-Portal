const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const hostname = new URL(supabaseUrl).hostname

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname,
        pathname: '/storage/**',
      },
    ],
  },
}

module.exports = nextConfig
