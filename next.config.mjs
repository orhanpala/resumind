/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['jspdf', 'html2canvas', 'fflate', 'pdf2json', 'mammoth'],
}

export default nextConfig
