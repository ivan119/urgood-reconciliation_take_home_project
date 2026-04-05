import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'csv-parse/sync';
import prisma from '../../utils/prisma'; // Actually wait, in Nuxt with Prisma, people use `lib/prisma` or global `prisma`. Let's just instantiate Prisma client here or we can use the Nuxt Prisma module if configured correctly.
// Let's instantiate it manually for standard seed.
import { PrismaClient } from '@prisma/client';
import { 
  getCycleDates, 
  isEligible, 
  calculateCreatorPayout, 
  calculateUrgoodFees, 
  calculateStripeFees, 
  isPayable 
} from '../../utils/billing';

const client = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // 1. Purge existing data
    await client.payoutState.deleteMany({});
    await client.reservation.deleteMany({});

    // 2. Read and parse CSV
    const csvPath = resolve(process.cwd(), 'app/assets/urgood_reservations.csv');
    const fileContent = readFileSync(csvPath, 'utf8');
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

    await client.reservation.createMany({
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
      const pairKey = `${res.creatorId}_${res.restaurantId}`;

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
        const [creatorId, restaurantId] = pairKey.split('_');
        
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
              const [creatorId, restaurantId] = pairKey.split('_');
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
                  urgoodFees: 0,
                  stripeFees: 0,
                  payable
              });
          }
      }
    }

    await client.payoutState.createMany({
      data: payoutStatesData
    });

    return { success: true, message: 'Database seeded successfully', recordsProcessed: records.length, payoutStatesCreated: payoutStatesData.length };
  } catch (error: any) {
    console.error('Seed Error:', error);
    return createError({ statusCode: 500, message: 'Seeding failed', data: error.message });
  }
});
