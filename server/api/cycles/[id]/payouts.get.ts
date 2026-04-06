import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const cycleDateRaw = getRouterParam(event, 'id');
  if (!cycleDateRaw) {
    return createError({ statusCode: 400, message: 'Cycle ID (start date) is required' });
  }

  const query = getQuery(event);
  const cycleStartDate = new Date(cycleDateRaw as string);

  const whereClause: any = { cycleStartDate };
  if (query.creator_id) {
    whereClause.creatorId = query.creator_id;
  }

  const payouts = await prisma.payoutState.findMany({
    where: whereClause
  });

  // Group by creatorId
  const creatorSummaries: Record<string, any> = {};

  for (const payout of payouts) {
    const cId = payout.creatorId;
    if (!creatorSummaries[cId]) {
      creatorSummaries[cId] = {
        creatorId: cId,
        cycleStartDate: payout.cycleStartDate,
        cycleEndDate: payout.cycleEndDate,
        totalPayableAmount: 0,
        totalRolledOverAmount: 0,
        details: []
      };
    }

    const sum = creatorSummaries[cId];

    if (payout.payable) {
      sum.totalPayableAmount += payout.totalAmount;
    } else {
      sum.totalRolledOverAmount += payout.totalAmount;
    }

    sum.details.push({
      restaurantId: payout.restaurantId,
      periodAmount: payout.periodAmount,
      rolledOverAmount: payout.rolledOverAmount,
      totalAmount: payout.totalAmount,
      payable: payout.payable
    });
  }

  return { creatorPayouts: Object.values(creatorSummaries) };
});
