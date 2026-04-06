import { parse } from 'csv-parse/sync';
import { prisma } from '../../utils/prisma'
import { 
  getCycleDates, 
  isEligible, 
  calculateCreatorPayout, 
  calculateUrgoodFees, 
  calculateStripeFees, 
  isPayable 
} from '../../utils/billing';

export default defineEventHandler(async (event) => {
  try {
    // 1. Purge existing data
    await prisma.payoutState.deleteMany({});
    await prisma.reservation.deleteMany({});

    // 2. Read and parse CSV
    // Nitro storage 'assets:server' maps to server/assets/
    const fileContent = await useStorage().getItemRaw<string>('assets:server:urgood_reservations.csv');
    if (!fileContent) {
      throw new Error('CSV file not found in storage');
    }

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // 3. Process records
    // CSV headers: reservation_id,restaurant_id,creator_id,reservation_dining_at,covers,per_cover_rate,status
    // Dates are UTC like '2026-03-02 13:22:40'

    const reservationsInput = records.map((r: any) => {
      return {
        // Just store the generated auto id for Prisma, or map from res_XXX? Schema uses Int @id @default(autoincrement())
        // But let's just insert
        diningAt: new Date(r.reservation_dining_at + 'Z'), // Ensure UTC
        status: r.status,
        verifiedCovers: parseInt(r.covers, 10),
        perCoverRate: Math.round(parseFloat(r.per_cover_rate) * 100), // Convert to cents
        creatorId: r.creator_id,
        restaurantId: r.restaurant_id
      };
    });

    await prisma.reservation.createMany({
      data: reservationsInput
    });

    // We need to fetch them back to have a stable sequence or we can just process `reservationsInput` functionally.
    // Let's sort all verified records chronologically by diningAt to build the cycles correctly.
    const verifiedReservations = reservationsInput
      .filter((r) => isEligible(r.status))
      .sort((a, b) => a.diningAt.getTime() - b.diningAt.getTime());

    // 4. Calculate Payouts per Cycle
    // Group records by cycle boundary
    type CycleGroup = {
      startDate: Date;
      endDate: Date;
      payouts: Record<string, number>; // key: creatorId_restaurantId, value: payout for period in cents
      covers: Record<string, number>; // key: creatorId_restaurantId, value: total covers
    };

    const cyclesMap = new Map<number, CycleGroup>(); // Map keyed by cycle start time

    for (const res of verifiedReservations) {
      const { cycleStart, cycleEnd } = getCycleDates(res.diningAt);
      const cycleKey = cycleStart.getTime();

      if (!cyclesMap.has(cycleKey)) {
        cyclesMap.set(cycleKey, {
          startDate: cycleStart,
          endDate: cycleEnd,
          payouts: {},
          covers: {}
        });
      }

      const cycle = cyclesMap.get(cycleKey)!;
      // Use a delimiter that won't collide with common IDs (avoid '_' collisions).
      const pairKey = `${res.creatorId}::${res.restaurantId}`;

      if (!cycle.payouts[pairKey]) cycle.payouts[pairKey] = 0;
      if (!cycle.covers[pairKey]) cycle.covers[pairKey] = 0;

      const payout = calculateCreatorPayout(res.verifiedCovers, res.perCoverRate);
      cycle.payouts[pairKey] += payout;
      cycle.covers[pairKey] += res.verifiedCovers;
    }

    // Process cycles chronologically to handle carry over logic
    const rolloverBalances: Record<string, number> = {};

    const sortedCycleKeys = Array.from(cyclesMap.keys()).sort();
    const payoutStatesData = [];

    for (const cycleKey of sortedCycleKeys) {
      const cycle = cyclesMap.get(cycleKey)!;

      for (const pairKey in cycle.payouts) {
        const [creatorId, restaurantId] = pairKey.split('::');
        
        const periodAmount = cycle.payouts[pairKey];
        const covers = cycle.covers[pairKey];
        const rolledOverAmount = rolloverBalances[pairKey] || 0;
        
        const totalAmount = periodAmount + rolledOverAmount;
        
        const payable = isPayable(periodAmount, rolledOverAmount);
        
        let newRollover = 0;
        if (payable) {
          // If payable, the debt is cleared.
          newRollover = 0;
        } else {
          // If not payable, everything rolls over to the next cycle.
          newRollover = totalAmount;
        }
        
        // Update the global rollover balances
        rolloverBalances[pairKey] = newRollover;

        // Calculate Fees (fees are only based on the NEW covers/payout this period)
        // Wait, URGOOD rule: "URGOOD fees (charged to restaurant): $0.50 per verified cover + 10% of creator payout."
        // Meaning periodAmount, not totalAmount (totalAmount might be deferred payout)
        const urgoodFees = calculateUrgoodFees(covers, periodAmount);
        // Stripe rule: 1.5% x (creator payout + URGOOD fees). 
        // As with above, assuming based on period activity, unless Stripe fee is charged on standard payout.
        // Let's assume based on periodAmount logic:
        const stripeFees = calculateStripeFees(periodAmount, urgoodFees);

        payoutStatesData.push({
          creatorId,
          restaurantId,
          cycleStartDate: cycle.startDate,
          cycleEndDate: cycle.endDate,
          periodAmount,
          rolledOverAmount,
          totalAmount,
          covers,
          urgoodFees,
          stripeFees,
          payable
        });
      }
      
      // What about creator_restaurant pairs that had no activity this cycle but have a rollover balance?
      // Strict rule: "If $25.00 or below, it rolls forward. Rollover must persist correctly across cycles."
      // If a pair had 0 activity this current cycle but has a positive rollover balance, should it generate an invoice/log?
      // Usually yes, the payout state persists. Let's include pairs with active rollovers even if 0 new activity.
      for (const pairKey in rolloverBalances) {
          if (!cycle.payouts[pairKey] && rolloverBalances[pairKey] > 0) {
              const [creatorId, restaurantId] = pairKey.split('::');
              const rolledOverAmount = rolloverBalances[pairKey];
              const periodAmount = 0;
              const totalAmount = rolledOverAmount;
              const payable = isPayable(0, rolledOverAmount);
              
              if (payable) {
                  rolloverBalances[pairKey] = 0;
              } else {
                  rolloverBalances[pairKey] = totalAmount; // stays the same
              }
              
              payoutStatesData.push({
                  creatorId,
                  restaurantId,
                  cycleStartDate: cycle.startDate,
                  cycleEndDate: cycle.endDate,
                  periodAmount: 0,
                  rolledOverAmount,
                  totalAmount,
                  covers: 0,
                  urgoodFees: 0,
                  stripeFees: 0,
                  payable
              });
          }
      }
    }

    // Final Deduplication Pass:
    // We utilize a Map keyed by [creatorId, restaurantId, cycleStartDate] to enforce uniqueness.
    // This approach ensures that if a record exists for both 'active cycle activity' and
    // 'idle rollover-only carryforward' within the same loop iteration, they are safely merged
    // (with the uniquePayoutStates.set ensuring the most accurate entry is preserved).
    // This mirrors the Database's UNIQUE constraint (@@unique([creatorId, restaurantId, cycleStartDate])).
    const uniquePayoutStates = new Map<string, (typeof payoutStatesData)[number]>()
    for (const ps of payoutStatesData) {
      uniquePayoutStates.set(
        `${ps.creatorId}::${ps.restaurantId}::${ps.cycleStartDate.toISOString()}`,
        ps,
      )
    }

    await prisma.payoutState.createMany({
      data: Array.from(uniquePayoutStates.values()),
    });

    return { success: true, message: 'Database seeded successfully', recordsProcessed: records.length, payoutStatesCreated: payoutStatesData.length };
  } catch (error: any) {
    console.error('Seed Error:', error);
    const message = String(error?.message ?? error)
    if (message.includes('does not exist in the current database')) {
      return createError({
        statusCode: 400,
        message: 'Database schema not applied yet',
        data:
          'Run `npx prisma migrate dev --name init` (recommended) or `npx prisma db push`, then retry POST /api/admin/seed.',
      })
    }

    return createError({ statusCode: 500, message: 'Seeding failed', data: message });
  }
});
