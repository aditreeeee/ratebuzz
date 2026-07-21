// Meal plan codes follow standard hospitality terminology. Old free-text mock
// values ("Room Only", "Breakfast Included", "Half Board", "Full Board",
// "All Inclusive") are remapped below:
//   Room Only          -> EP  (European Plan)
//   Breakfast Included  -> CP  (Continental Plan)
//   Half Board          -> MAP (Modified American Plan)
//   Full Board          -> AP  (American Plan)
//   All Inclusive       -> AP  (American Plan; closest standard code — this
//                                codebase does not model an "all-inclusive"
//                                tier beyond full board)
export const MEAL_PLANS = ["EP", "CP", "MAP", "AP"];

export const MEAL_PLAN_DETAILS = {
  EP: { name: "European Plan", description: "Room Only" },
  CP: { name: "Continental Plan", description: "Room + Breakfast" },
  MAP: { name: "Modified American Plan", description: "Room + Breakfast + Lunch or Dinner" },
  AP: { name: "American Plan", description: "Room + Breakfast + Lunch + Dinner" },
};

export function mealPlanLabel(code) {
  const details = MEAL_PLAN_DETAILS[code];
  return details ? `${details.name} — ${details.description}` : code;
}

export const CANCELLATION_POLICIES = ["Free Cancellation (24h)", "Free Cancellation (72h)", "Non-Refundable", "Partial Refund"];

// A Rate Plan is a long-lived pricing *strategy* — it never expires on its
// own. Its lifecycle is driven purely by this status; actual time-boxed
// pricing lives in each record's `pricingPeriods` array (see
// src/lib/pricingPeriods.js for the Scheduled/Active/Expired classification).
export const RATE_PLAN_STATUSES = ["Draft", "Active", "Seasonal", "Archived", "Inactive"];

export let RATE_PLANS = [
  {
    id: "RP-3001", roomId: "RM-2001", name: "Best Flexible Rate", mealPlan: "CP", cancellationPolicy: "Free Cancellation (24h)",
    status: "Active", taxInclusive: false, taxPercent: 12,
    pricingPeriods: [
      { id: "PP-1", effectiveFrom: "2026-01-01", effectiveTo: "2026-12-31", baseRate: 320, weekendRate: 380, childRate: 20, extraAdultRate: 45, currency: "USD", archived: false },
    ],
  },
  {
    id: "RP-3002", roomId: "RM-2001", name: "Advance Purchase Saver", mealPlan: "EP", cancellationPolicy: "Non-Refundable",
    status: "Active", taxInclusive: true, taxPercent: 12,
    pricingPeriods: [
      { id: "PP-1", effectiveFrom: "2025-01-01", effectiveTo: "2025-12-31", baseRate: 245, weekendRate: 285, childRate: 10, extraAdultRate: 35, currency: "USD", archived: false },
      { id: "PP-2", effectiveFrom: "2026-01-01", effectiveTo: "2026-12-31", baseRate: 265, weekendRate: 310, childRate: 15, extraAdultRate: 40, currency: "USD", archived: false },
    ],
  },
  {
    id: "RP-3003", roomId: "RM-2003", name: "Suite All Inclusive", mealPlan: "AP", cancellationPolicy: "Free Cancellation (72h)",
    status: "Active", taxInclusive: false, taxPercent: 8,
    pricingPeriods: [
      { id: "PP-1", effectiveFrom: "2026-02-01", effectiveTo: "2026-11-30", baseRate: 890, weekendRate: 990, childRate: 60, extraAdultRate: 120, currency: "USD", archived: false },
    ],
  },
  {
    id: "RP-3004", roomId: "RM-2004", name: "Corporate Rate", mealPlan: "CP", cancellationPolicy: "Free Cancellation (24h)",
    status: "Active", taxInclusive: true, taxPercent: 20,
    pricingPeriods: [
      { id: "PP-1", effectiveFrom: "2026-01-01", effectiveTo: "2027-01-01", baseRate: 210, weekendRate: 195, childRate: 0, extraAdultRate: 35, currency: "GBP", archived: false },
      { id: "PP-2", effectiveFrom: "2027-02-01", effectiveTo: "2027-04-30", baseRate: 225, weekendRate: 205, childRate: 0, extraAdultRate: 38, currency: "GBP", archived: false },
    ],
  },
  {
    id: "RP-3005", roomId: "RM-2006", name: "Villa Half Board", mealPlan: "MAP", cancellationPolicy: "Partial Refund",
    status: "Inactive", taxInclusive: false, taxPercent: 5,
    pricingPeriods: [
      { id: "PP-1", effectiveFrom: "2026-03-01", effectiveTo: "2026-10-31", baseRate: 1150, weekendRate: 1290, childRate: 75, extraAdultRate: 150, currency: "AED", archived: false },
    ],
  },
];
