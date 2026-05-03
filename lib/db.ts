import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Lazy singleton — only instantiate when first property is accessed so
// importing this module during Next.js static-page collection doesn't throw
// if DATABASE_URL is absent at build time.
let _instance: PrismaClient | null = null;

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!_instance) {
      _instance = globalForPrisma.prisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = _instance;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (_instance as any)[prop];
    return typeof value === 'function' ? value.bind(_instance) : value;
  },
});
