import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Vercel Blobストアのホスト名を追加
      // 実際のストアIDはVercelダッシュボードで確認してください
      // 形式: https://{store-id}.public.blob.vercel-storage.com
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
