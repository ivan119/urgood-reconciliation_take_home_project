export function getCycleDates(diningAtUTC: Date) {
  // Cycle starts Monday 5:00:00 AM UTC
  // Cycle ends next Monday 4:59:59 AM UTC
  const date = new Date(diningAtUTC.getTime());
  
  // Find the exact hour to adjust for the 5:00 AM offset
  // By subtracting 5 hours, we align the start of the week check to midnight.
  const adjustedTime = date.getTime() - 5 * 60 * 60 * 1000;
  const adjustedDate = new Date(adjustedTime);
  
  const day = adjustedDate.getUTCDay(); // 0 is Sunday, 1 is Monday ...
  // Calculate distance back to Monday (if day is 0, we subtract 6, otherwise subtract day - 1)
  const diffToMonday = day === 0 ? -6 : -(day - 1);
  
  const cycleStart = new Date(adjustedDate.getTime());
  cycleStart.setUTCDate(adjustedDate.getUTCDate() + diffToMonday);
  cycleStart.setUTCHours(0, 0, 0, 0); // Midnight of the adjusted week
  
  // Shift strictly back forward by 5 hours to restore the exact 5:00 AM boundary
  const finalCycleStart = new Date(cycleStart.getTime() + 5 * 60 * 60 * 1000);
  
  // Next cycle starts exactly 7 days later
  const cycleEnd = new Date(finalCycleStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Actually, specs say "end the following Monday 4:59:59 AM".
  // But technically the end boundary is exclusive in standard date logic, or inclusive if we do - 1000ms.
  // We'll return the exact start and (start + 7 days) as the exclusive end, standard boundary check `t < cycleEnd`.
  
  return { cycleStart: finalCycleStart, cycleEnd };
}

export function isEligible(status: string) {
  return status === 'verified';
}

export function calculateCreatorPayout(verifiedCovers: number, perCoverRateCents: number) {
  return Math.round(verifiedCovers * perCoverRateCents);
}

export function calculateUrgoodFees(verifiedCovers: number, creatorPayoutCents: number) {
  const baseVcCents = verifiedCovers * 50; 
  const payoutFeeCents = Math.round(creatorPayoutCents * 0.10);
  return baseVcCents + payoutFeeCents;
}

export function calculateStripeFees(creatorPayoutCents: number, urgoodFeesCents: number) {
  return Math.round((creatorPayoutCents + urgoodFeesCents) * 0.015);
}

export function isPayable(currentAmountCents: number, previousRolloverCents: number) {
  return (currentAmountCents + previousRolloverCents) > 2500;
}
