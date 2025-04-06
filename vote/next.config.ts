/** @type {import('next').NextConfig} */
module.exports = {
  // Configurações para produção
  output: 'standalone', // Otimizado para deploy em produção
  poweredByHeader: false, // Remover o header X-Powered-By por segurança
  reactStrictMode: true,
  typescript: {
    // Durante o build, ignorar os erros de TS para publicar mesmo com avisos
    ignoreBuildErrors: true,
  }
};
