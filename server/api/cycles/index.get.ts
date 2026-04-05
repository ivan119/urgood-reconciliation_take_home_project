import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

export default defineEventHandler(async () => {
  // Find distinct cycles
  const cycles = await client.payoutState.findMany({
    select: {
      cycleStartDate: true,
      cycleEndDate: true,
    },
    distinct: ['cycleStartDate'],
    orderBy: {
      cycleStartDate: 'asc'
    }
  });

  return { cycles };
});
