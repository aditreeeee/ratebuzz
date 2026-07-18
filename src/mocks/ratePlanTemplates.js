export const RATE_PLAN_TEMPLATES = [
  {
    key: "bar",
    label: "BAR",
    values: { name: "Best Available Rate", mealPlan: "EP", cancellationPolicy: "Free Cancellation (24h)", basePrice: 220, weekendPrice: 260, extraAdultPrice: 35, childPrice: 15, status: "Active" },
  },
  {
    key: "corporate",
    label: "Corporate",
    values: { name: "Corporate Rate", mealPlan: "CP", cancellationPolicy: "Free Cancellation (24h)", basePrice: 195, weekendPrice: 180, extraAdultPrice: 30, childPrice: 0, status: "Active" },
  },
  {
    key: "long-stay",
    label: "Long Stay",
    values: { name: "Long Stay Rate", mealPlan: "MAP", cancellationPolicy: "Partial Refund", basePrice: 165, weekendPrice: 165, extraAdultPrice: 25, childPrice: 10, status: "Active" },
  },
  {
    key: "weekend",
    label: "Weekend",
    values: { name: "Weekend Getaway", mealPlan: "CP", cancellationPolicy: "Free Cancellation (72h)", basePrice: 240, weekendPrice: 310, extraAdultPrice: 40, childPrice: 20, status: "Active" },
  },
  {
    key: "non-refundable",
    label: "Non-Refundable",
    values: { name: "Advance Purchase Non-Refundable", mealPlan: "EP", cancellationPolicy: "Non-Refundable", basePrice: 175, weekendPrice: 205, extraAdultPrice: 30, childPrice: 10, status: "Active" },
  },
  {
    key: "early-bird",
    label: "Early Bird",
    values: { name: "Early Bird Special", mealPlan: "CP", cancellationPolicy: "Partial Refund", basePrice: 190, weekendPrice: 220, extraAdultPrice: 30, childPrice: 15, status: "Active" },
  },
];
