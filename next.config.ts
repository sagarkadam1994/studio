import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    if (isServer) {
      // Add node-fetch to externals to avoid bundling it in the server build
      config.externals.push('node-fetch');
    }
    return config;
  },
  experimental: {
    appDir: true,
  },
  allowedDevOrigins: ["https://6000-firebase-studio-1754858165997.cluster-fdkw7vjj7bgguspe3fbbc25tra.cloudworkstations.dev"]
};

export default nextConfig;
