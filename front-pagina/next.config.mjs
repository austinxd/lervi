/** @type {import('next').NextConfig} */
const config = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8100" },
      { protocol: "http", hostname: "localhost", port: "8100" },
      { protocol: "https", hostname: "api.lervi.io" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${process.env.INTERNAL_MEDIA_URL || "http://127.0.0.1:8100/media"}/:path*`,
      },
    ];
  },
};

export default config;
