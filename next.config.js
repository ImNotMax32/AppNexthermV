/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour les assets statiques
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  
  // Configuration pour éviter les problèmes de build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuration pour les images
  images: {
    domains: [],
    unoptimized: true, // Désactiver l'optimisation d'images pour éviter les problèmes
  },
  
  // Configuration pour les pages dynamiques
  trailingSlash: false,
  
  // Configuration pour éviter les problèmes de cache
  generateEtags: false,
  
  // Configuration spécifique pour Framer Motion
  transpilePackages: ['framer-motion'],
  
  // Configuration pour éviter les problèmes de compilation
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configuration Turbopack pour Next.js 16
  turbopack: {},
  
  // Configuration webpack (fallback si Turbopack ne fonctionne pas)
  webpack: (config, { isServer }) => {
    // Éviter les problèmes avec les modules côté client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
