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
// own; its lifecycle is driven purely by this status. `seasons` (see below)
// references reusable Rate Season master templates by name — it never
// stores time-boxed or historical pricing itself (see
// src/mocks/masterData.js's RATE_SEASONS_MASTER, and RateSeasonForm.jsx).
export const RATE_PLAN_STATUSES = ["Draft", "Active", "Seasonal", "Archived", "Inactive"];

export let RATE_PLANS = [
  {
    id: "RP-3001", roomId: "RM-2001", name: "Best Flexible Rate", mealPlan: "CP", cancellationPolicy: "Free Cancellation (24h)",
    status: "Active", taxInclusive: false, taxPercent: 12,
    seasons: ["Standard Season"],
  },
  {
    id: "RP-3002", roomId: "RM-2001", name: "Advance Purchase Saver", mealPlan: "EP", cancellationPolicy: "Non-Refundable",
    status: "Active", taxInclusive: true, taxPercent: 12,
    seasons: ["Standard Season", "Weekend Premium"],
  },
  {
    id: "RP-3003", roomId: "RM-2003", name: "Suite All Inclusive", mealPlan: "AP", cancellationPolicy: "Free Cancellation (72h)",
    status: "Active", taxInclusive: false, taxPercent: 8,
    seasons: ["Peak Season"],
  },
  {
    id: "RP-3004", roomId: "RM-2004", name: "Corporate Rate", mealPlan: "CP", cancellationPolicy: "Free Cancellation (24h)",
    status: "Active", taxInclusive: true, taxPercent: 20,
    seasons: ["Standard Season"],
  },
  {
    id: "RP-3005", roomId: "RM-2006", name: "Villa Half Board", mealPlan: "MAP", cancellationPolicy: "Partial Refund",
    status: "Inactive", taxInclusive: false, taxPercent: 5,
    seasons: ["Holiday Season", "Festival Season"],
  },
];
