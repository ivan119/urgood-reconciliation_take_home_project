import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  // Find distinct cycles
  const cycles = await prisma.payoutState.findMany({
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
