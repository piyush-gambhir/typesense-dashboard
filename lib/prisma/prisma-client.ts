import { PrismaClient } from '@prisma/client';

// Helper function to create a PrismaClient
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient();
};

let prisma: PrismaClient;

if (process.env.ENVIRONMENT === 'production') {
  prisma = createPrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = createPrismaClient();
  }
  prisma = globalThis.prisma;
}

export default prisma;
