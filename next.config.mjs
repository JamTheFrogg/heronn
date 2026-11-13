/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static site for Cloudflare Pages: `npm run build` writes out/.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
