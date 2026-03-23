import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@libsql/client',
    'libsql',
    '@prisma/adapter-libsql',
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
  ],
}

export default nextConfig
