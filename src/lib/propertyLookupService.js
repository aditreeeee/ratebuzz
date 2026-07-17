// Frontend-only mock lookup. Designed so `lookupPropertyById` can later be
// swapped for a real ASP.NET API call (e.g. GET /api/properties/{id}) against
// the eGlobe Solutions SQL Server database without changing callers.

const PROPERTY_ID_PATTERN = /^PROP-\d{4,}$/i;

export function validatePropertyIdFormat(id) {
  if (!id || !id.trim()) return { valid: false, message: "Property ID is required." };
  if (!PROPERTY_ID_PATTERN.test(id.trim())) {
    return { valid: false, message: "Expected format: PROP-1001." };
  }
  return { valid: true, message: "" };
}

// Returns a discriminated result: { state: "found" | "not-found" | "duplicate", property?, matches? }
export function lookupPropertyById(properties, id) {
  const normalized = id.trim().toUpperCase();
  const matches = properties.filter((p) => p.id.toUpperCase() === normalized);
  if (matches.length === 0) return { state: "not-found" };
  if (matches.length > 1) return { state: "duplicate", matches };
  return { state: "found", property: matches[0] };
}
