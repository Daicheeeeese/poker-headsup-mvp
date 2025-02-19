/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // AdSenseのドメインを許可
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://partner.googleadservices.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; frame-src https://googleads.g.doubleclick.net https://www.google.com;`,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 