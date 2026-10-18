/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  async redirects() {
    // Old static-export URLs (`/pricing.html`, `/blogs/foo.html`, `/index.html`) keep working.
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/:path*.html", destination: "/:path*", permanent: true },
    ];
  },
  async headers() {
    // Mirrored Framer bundles have content-hashed names (scripts/mirror_framer.py).
    return [
      {
        source: "/framer/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Content-Type", value: "text/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;
