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
export const RATE_PLAN_STATUSES = ["Active", "Inactive", "Archived"];

export let RATE_PLANS = [
  { id: "RP-3001", roomId: "RM-2001", name: "Best Flexible Rate", mealPlan: "CP", cancellationPolicy: "Free Cancellation (24h)", basePrice: 320, weekendPrice: 380, extraAdultPrice: 45, childPrice: 20, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Active" },
  { id: "RP-3002", roomId: "RM-2001", name: "Advance Purchase Saver", mealPlan: "EP", cancellationPolicy: "Non-Refundable", basePrice: 265, weekendPrice: 310, extraAdultPrice: 40, childPrice: 15, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Active" },
  { id: "RP-3003", roomId: "RM-2003", name: "Suite All Inclusive", mealPlan: "AP", cancellationPolicy: "Free Cancellation (72h)", basePrice: 890, weekendPrice: 990, extraAdultPrice: 120, childPrice: 60, validFrom: "2026-02-01", validTo: "2026-11-30", status: "Active" },
  { id: "RP-3004", roomId: "RM-2004", name: "Corporate Rate", mealPlan: "CP", cancellationPolicy: "Free Cancellation (24h)", basePrice: 210, weekendPrice: 195, extraAdultPrice: 35, childPrice: 0, validFrom: "2026-01-01", validTo: "2027-01-01", status: "Active" },
  { id: "RP-3005", roomId: "RM-2006", name: "Villa Half Board", mealPlan: "MAP", cancellationPolicy: "Partial Refund", basePrice: 1150, weekendPrice: 1290, extraAdultPrice: 150, childPrice: 75, validFrom: "2026-03-01", validTo: "2026-10-31", status: "Inactive" },
];

export function nextRatePlanId() {
  const nums = RATE_PLANS.map((r) => Number(r.id.split("-")[1]) || 3000);
  return `RP-${Math.max(...nums, 3000) + 1}`;
}
