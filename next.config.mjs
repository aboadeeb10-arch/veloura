import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { remotePatterns: [ { protocol: "https", hostname: "*.public.blob.vercel-storage.com" }, { protocol: "https", hostname: "images.unsplash.com" } ] },
  experimental: { serverActions: { bodySizeLimit: "8mb" } },
};

export default withNextIntl(nextConfig);
