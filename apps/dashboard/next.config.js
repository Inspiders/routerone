/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" produces a self-contained build — needed for the Docker runner stage.
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
