// Frontend-only mock lookup. Designed so the implementation of `lookupPropertyById`
// can later be swapped for a real ASP.NET API call (e.g. GET /api/properties/{id})
// against the eGlobe Solutions SQL Server database without changing callers.

const PROPERTY_ID_PATTERN = /^PROP-\d{4,}$/i;

export function validatePropertyIdFormat(id) {
  if (!id || !id.trim()) return { valid: false, message: "Property ID is required." };
  if (!PROPERTY_ID_PATTERN.test(id.trim())) {
    return { valid: false, message: "Expected format: PROP-1001." };
  }
  return { valid: true, message: "" };
}

export function lookupPropertyById(properties, id) {
  const normalized = id.trim().toUpperCase();
  return properties.find((p) => p.id.toUpperCase() === normalized) || null;
}
