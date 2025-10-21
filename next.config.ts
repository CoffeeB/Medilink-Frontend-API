import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mrhmqmpbzkfkkdhdortm.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
