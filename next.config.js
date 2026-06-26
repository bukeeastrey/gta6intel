/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Allow Supabase Storage (and common CDNs) as next/image sources.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};
module.exports = nextConfig;
