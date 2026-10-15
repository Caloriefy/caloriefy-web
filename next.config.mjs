/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Old static-export URLs (`/pricing.html`, `/blogs/foo.html`, `/index.html`) keep working.
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/:path*.html", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
