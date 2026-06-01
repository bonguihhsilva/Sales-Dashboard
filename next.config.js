/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // pdf-parse v2 nao empacota no webpack (exports field) -> tratar como externo do servidor
  serverExternalPackages: ['pdf-parse'],
}

module.exports = nextConfig
