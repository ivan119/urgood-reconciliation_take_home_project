import { describe, it, expect } from 'vitest';
import {
  getCycleDates,
  isEligible,
  calculateCreatorPayout,
  calculateUrgoodFees,
  calculateStripeFees,
  isPayable
} from '../server/utils/billing';

describe('Billing Logic', () => {
  it('assigns correct cycle dates', () => {
    // A Wednesday: 2026-03-04T12:00:00Z
    const testDate1 = new Date('2026-03-04T12:00:00Z');
    const cycle1 = getCycleDates(testDate1);
    
    // Cycle should start Monday March 2, 05:00:00Z
    expect(cycle1.cycleStart.toISOString()).toBe('2026-03-02T05:00:00.000Z');
    // Cycle should end Monday March 9, 05:00:00Z
    expect(cycle1.cycleEnd.toISOString()).toBe('2026-03-09T05:00:00.000Z');

    // A Monday right on the boundary: 2026-03-02T05:00:00Z
    const testDate2 = new Date('2026-03-02T05:00:00Z');
    const cycle2 = getCycleDates(testDate2);
    // Boundary is inclusive the new week
    expect(cycle2.cycleStart.toISOString()).toBe('2026-03-02T05:00:00.000Z');

    // A Monday right before the boundary: 2026-03-02T04:59:59Z
    const testDate3 = new Date('2026-03-02T04:59:59Z');
    const cycle3 = getCycleDates(testDate3);
    // Should bump to the previous Monday
    expect(cycle3.cycleStart.toISOString()).toBe('2026-02-23T05:00:00.000Z');
  });

  it('calculates eligibility', () => {
    expect(isEligible('verified')).toBe(true);
    expect(isEligible('canceled')).toBe(false);
    expect(isEligible('disputed')).toBe(false);
  });

  it('calculates creator payout correctly in cents', () => {
    // 5 covers, $8.00 (800 cents) -> 4000 cents ($40.00)
    expect(calculateCreatorPayout(5, 800)).toBe(4000);
  });

  it('calculates urgood fees correctly in cents', () => {
    // 5 covers * 50 cents = 250
    // payout = 4000 cents -> 10% = 400 cents
    // total = 650 cents ($6.50)
    expect(calculateUrgoodFees(5, 4000)).toBe(650);
  });

  it('calculates stripe fees correctly in cents', () => {
    // payout = 4000, urgood = 650 -> sum = 4650
    // stripe 1.5% of 4650 = 69.75 cents -> Math.round -> 70 cents
    expect(calculateStripeFees(4000, 650)).toBe(70);
  });

  it('evaluates $25.00 rollover threshold', () => {
    // 25.00 is 2500 cents
    // Exactly 2500 is not payable (must EXCEED 2500)
    expect(isPayable(2500, 0)).toBe(false);
    
    // Total 2501 is payable
    expect(isPayable(2000, 501)).toBe(true);

    // Well under
    expect(isPayable(1000, 0)).toBe(false);
  });
});
