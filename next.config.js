/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // pdf-parse v2 nao empacota no webpack (exports field) -> tratar como externo do servidor
  // pdfkit le arquivos .afm (metricas de fonte) do disco em runtime; webpack inlina o codigo
  // mas nao copia os .afm -> ENOENT no build standalone. Externalizar faz o nft copiar o pacote.
  serverExternalPackages: ['pdf-parse', 'pdfkit'],
}

module.exports = withSentryConfig(nextConfig, {
  // Suppress source map upload if SENTRY_AUTH_TOKEN is not set (CI/local)
  silent: !process.env.SENTRY_AUTH_TOKEN,
  // Disable Sentry entirely if DSN is not configured
  disableServerWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  disableClientWebpackPlugin: !process.env.NEXT_PUBLIC_SENTRY_DSN,
  hideSourceMaps: true,
  widenClientFileUpload: false,
})
