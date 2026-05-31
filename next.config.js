/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cs.copart.com' },
      { protocol: 'https', hostname: 'vi.cs.copart.com' },
      { protocol: 'https', hostname: 'img.iaai.com' },
      { protocol: 'https', hostname: '**.iaai.com' },
      { protocol: 'https', hostname: '**.copart.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
