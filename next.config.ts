import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.simpleicons.org" },
    ],
  },
  async redirects() {
    return [{ source: "/projetos", destination: "/#projetos", permanent: false }];
  },
};

export default nextConfig;
