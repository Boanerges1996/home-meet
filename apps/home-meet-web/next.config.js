/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['phubie-staging.s3.amazonaws.com'],
  },
};

module.exports = nextConfig;
