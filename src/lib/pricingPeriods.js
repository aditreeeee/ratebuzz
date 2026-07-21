// A Pricing Period's display status is always computed from today's date —
// never stored — per the "Automatic Status Handling" requirement. The only
// stored, user-controlled state on a period is `archived` (soft-hide via the
// Archive action, independent of where it falls relative to today).
export function classifyPeriodStatus(period, today = new Date()) {
  if (period.archived) return "Archived";
  const todayISO = today.toISOString().slice(0, 10);
  if (todayISO < period.effectiveFrom) return "Scheduled";
  if (todayISO > period.effectiveTo) return "Expired";
  return "Active";
}

export function getCurrentActivePeriod(periods = []) {
  return periods.find((p) => classifyPeriodStatus(p) === "Active") || null;
}

export function nextPeriodId(periods = []) {
  const nums = periods.map((p) => Number(String(p.id).split("-")[1]) || 0);
  return `PP-${Math.max(0, ...nums) + 1}`;
}
