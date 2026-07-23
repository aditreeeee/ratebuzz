import { getAppSettings } from "./appSettingsStore.js";

// `currency`/`dateFormat`/`timeZone` default to whatever General Settings has
// saved (live via appSettingsStore, no re-render needed to pick up a
// change) — an explicit `currency` argument still wins where a record
// carries its own (e.g. a Pricing Range's own currency field).
export function formatCurrency(value, currency) {
  const resolvedCurrency = currency || getAppSettings().general.currency;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: resolvedCurrency }).format(value);
  } catch {
    return `${resolvedCurrency} ${value}`;
  }
}

// Matches the exact options offered by General Settings' "Default Date
// Format" Select — built from the same Intl parts regardless of format so
// day/month/year always come from the same (optionally time-zone-shifted)
// calendar date, just reassembled in the chosen token order.
export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const { dateFormat, timeZone } = getAppSettings().general;
  const dtfOptions = { year: "numeric", month: "short", day: "2-digit" };
  if (timeZone && timeZone !== "UTC") dtfOptions.timeZone = timeZone;
  const parts = new Intl.DateTimeFormat("en-US", dtfOptions).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value || "";
  const year = get("year");
  const month = get("month"); // e.g. "Jan"
  const day = get("day"); // e.g. "05"
  const numericOptions = { month: "2-digit" };
  if (timeZone && timeZone !== "UTC") numericOptions.timeZone = timeZone;
  const monthNum = new Intl.DateTimeFormat("en-US", numericOptions).format(d);
  switch (dateFormat) {
    case "MM/DD/YYYY": return `${monthNum}/${day}/${year}`;
    case "DD/MM/YYYY": return `${day}/${monthNum}/${year}`;
    case "YYYY-MM-DD": return `${year}-${monthNum}-${day}`;
    case "DD MMM YYYY":
    default:
      return `${day} ${month} ${year}`;
  }
}

export function usePaginatedSortedFiltered({ data, search, searchFields, filters, sortKey, sortDir, page, pageSize }) {
  let result = data;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((item) => searchFields.some((f) => String(item[f] ?? "").toLowerCase().includes(q)));
  }

  Object.entries(filters || {}).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      if (val.length > 0) result = result.filter((item) => val.includes(item[key]));
    } else if (val !== "" && val !== undefined && val !== null) {
      result = result.filter((item) => item[key] === val);
    }
  });

  if (sortKey) {
    result = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }

  const total = result.length;
  const start = (page - 1) * pageSize;
  const pageData = result.slice(start, start + pageSize);

  return { pageData, total };
}
