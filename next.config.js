/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'portal-absensi-smk-fallback-secret-key-32chars',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};

module.exports = nextConfig;
