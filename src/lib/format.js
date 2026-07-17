export function formatCurrency(value, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value}`;
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export function usePaginatedSortedFiltered({ data, search, searchFields, filters, sortKey, sortDir, page, pageSize }) {
  let result = data;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((item) => searchFields.some((f) => String(item[f] ?? "").toLowerCase().includes(q)));
  }

  Object.entries(filters || {}).forEach(([key, val]) => {
    if (val) result = result.filter((item) => item[key] === val);
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
