// Pure helpers for validating a Rate Plan Room's Pricing Ranges table — no
// React/DataContext dependency so they're trivially unit-testable and
// reusable wherever pricing-range rows are edited.

// Two date ranges overlap when each range's start is before the other's end
// (or equal, since date-only ranges are inclusive on both ends). A blank
// start/end means "unbounded" in that direction. Adjacent-but-not-touching
// ranges (one ends the day before the other starts) are NOT an overlap.
// A row with `alwaysApplicable: true` is unbounded by construction — the UI
// (PricingRangesTable) always clears its startDate/endDate to "" the moment
// that flag is set, so it naturally falls into the blank-start/blank-end case
// here with no separate code path needed.
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  const aS = aStart ? new Date(aStart).getTime() : -Infinity;
  const aE = aEnd ? new Date(aEnd).getTime() : Infinity;
  const bS = bStart ? new Date(bStart).getTime() : -Infinity;
  const bE = bEnd ? new Date(bEnd).getTime() : Infinity;
  return aS <= bE && bS <= aE;
}

// Two rows conflict if their date ranges overlap AND their occupancy values
// are equal OR either one is blank ("Any" — applies across every occupancy).
function occupancyConflicts(a, b) {
  const occA = a.occupancy || "";
  const occB = b.occupancy || "";
  return occA === occB || occA === "" || occB === "";
}

// Returns an array of conflicting row-id pairs: [[idA, idB], ...]. A row
// explicitly marked "Always Applicable" is never flagged, against any other
// row — that's the whole point of the flag (a deliberate, permanent
// override), not something that should compete with date-scoped rows for
// the same occupancy. Without this, two brand-new/unfilled rows (both
// blank dates + blank "Any" occupancy by default) or an Always Applicable
// row alongside a normal dated one would trip the overlap check before the
// user has meaningfully entered anything — a false positive, not a genuine
// conflict.
export function findPricingPeriodConflicts(periods) {
  const conflicts = [];
  for (let i = 0; i < periods.length; i++) {
    for (let j = i + 1; j < periods.length; j++) {
      const a = periods[i];
      const b = periods[j];
      if (a.alwaysApplicable || b.alwaysApplicable) continue;
      // A row with no price entered yet is an unfilled draft, not a real
      // pricing range — two blank new rows (both default to unbounded dates
      // + "Any" occupancy) shouldn't be flagged as conflicting before the
      // user has entered anything.
      if (a.price === "" || a.price === null || b.price === "" || b.price === null) continue;
      if (occupancyConflicts(a, b) && rangesOverlap(a.startDate, a.endDate, b.startDate, b.endDate)) {
        conflicts.push([a.id, b.id]);
      }
    }
  }
  return conflicts;
}

// Convenience: a Set of every row id that appears in at least one conflict —
// handy for driving per-row error styling without re-scanning pairs.
export function conflictingRowIds(periods) {
  const ids = new Set();
  for (const [a, b] of findPricingPeriodConflicts(periods)) {
    ids.add(a);
    ids.add(b);
  }
  return ids;
}
