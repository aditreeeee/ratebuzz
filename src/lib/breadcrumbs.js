// Shared "Properties → {property}" breadcrumb prefix used by every profile
// page scoped under a Property (Room/Rate Plan/Competitor/Comp Set) — each
// page appends its own trailing segments after this. `property` may be null
// (e.g. an orphaned/unresolvable reference), in which case only "Properties"
// is included, matching the ad hoc ternary these pages used before.
export function propertyScopedCrumbs(property) {
  return [
    { label: "Properties", to: "/portal/properties" },
    ...(property ? [{ label: property.name, to: `/portal/properties/${property.id}` }] : []),
  ];
}
