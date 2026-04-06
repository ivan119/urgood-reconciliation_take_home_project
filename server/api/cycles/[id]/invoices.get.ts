import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const cycleDateRaw = getRouterParam(event, 'id');
  if (!cycleDateRaw) {
    return createError({ statusCode: 400, message: 'Cycle ID (start date) is required' });
  }

  const query = getQuery(event);
  const cycleStartDate = new Date(cycleDateRaw as string);

  // An invoice for a restaurant per cycle is the aggregation of all payouts to all creators for that restaurant in that cycle.
  // Group by restaurantId
  
  const whereClause: any = { cycleStartDate };
  if (query.restaurant_id) {
    whereClause.restaurantId = query.restaurant_id;
  }

  const payouts = await prisma.payoutState.findMany({
    where: whereClause
  });

  // Group by restaurantId
  const restaurantInvoices: Record<string, any> = {};

  for (const payout of payouts) {
    const rId = payout.restaurantId;
    if (!restaurantInvoices[rId]) {
      restaurantInvoices[rId] = {
        restaurantId: rId,
        cycleStartDate: payout.cycleStartDate,
        cycleEndDate: payout.cycleEndDate,
        // Wait, URGOOD rule: "total creator payments, total URGOOD fees, total Stripe fees, grand total, and per-creator detail"
        // Wait, "creator payment" goes to the creator IF payable?
        // Note: The prompt says "total creator payments". If a creator's balance is not payable (i.e. <$25), they don't get paid.
        // But the fee is usually based on generated amounts. Wait, if a creator isn't paid, the restaurant still owes URGOOD for the covers and URGOOD fee.
        // Actually, Stripe and URGOOD fee might be charged immediately or only upon payout.
        // Let's just aggregate whatever is in the PayoutState record.
        totalCreatorPayments: 0,
        totalUrgoodFees: 0,
        totalStripeFees: 0,
        grandTotal: 0,
        details: []
      };
    }

    const inv = restaurantInvoices[rId];
    
    // Only count creator payment if payable is true
    const creatorPayment = payout.payable ? payout.totalAmount : 0;
    
    inv.totalCreatorPayments += creatorPayment;
    inv.totalUrgoodFees += payout.urgoodFees;
    inv.totalStripeFees += payout.stripeFees;
    inv.grandTotal += (creatorPayment + payout.urgoodFees + payout.stripeFees);

    inv.details.push({
      creatorId: payout.creatorId,
      covers: payout.covers,
      periodAmount: payout.periodAmount,
      rolledOverAmount: payout.rolledOverAmount,
      payable: payout.payable,
      payout: creatorPayment,
      urgoodFees: payout.urgoodFees,
      stripeFees: payout.stripeFees
    });
  }

  return { invoices: Object.values(restaurantInvoices) };
});
