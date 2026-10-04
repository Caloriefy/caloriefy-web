const pages = ["pricing", "contact", "download", "blogs", "stories", "privacy-policy", "terms-and-conditions"];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      ...pages.map((p) => ({ source: `/${p}`, destination: `/${p}.html` })),
      { source: "/blogs/:slug", destination: "/blogs/:slug.html" },
      { source: "/stories/:slug", destination: "/stories/:slug.html" },
    ];
  },
};

export default nextConfig;
