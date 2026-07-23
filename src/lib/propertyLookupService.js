// Frontend-only mock lookup. Designed so `lookupPropertyById` can later be
// swapped for a real ASP.NET API call (e.g. GET /api/properties/{id}) against
// the eGlobe Solutions SQL Server database without changing callers.

// No fixed ID format is enforced here on purpose — there's no backend/database
// generating IDs in a specific shape yet, so requiring a hardcoded pattern
// (e.g. "PROP-1001") only produces false validation errors for perfectly
// reasonable IDs. Any non-empty value is accepted; `lookupPropertyById` below
// is what actually determines whether it matches a real property.
export function validatePropertyIdFormat(id) {
  if (!id || !id.trim()) return { valid: false, message: "Property ID is required." };
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
