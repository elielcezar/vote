/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para produção
  output: 'standalone', // Otimizado para deploy em produção
  poweredByHeader: false, // Remover o header X-Powered-By por segurança
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
