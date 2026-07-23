import React, { useState } from "react";
import { FolderInput, Info } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Checkbox } from "../../components/ui/Checkbox.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

// Imports every member Competitor Property of one or more selected Comp Sets
// into one or more target benchmark properties. Each imported competitor
// becomes a brand-new, fully independent Competitor Property record (a copy
// of the source's fields under the target `propertyId`) — never a reference
// or a shared row — while a fresh `compSetMemberships` row preserves its
// association with the Comp Set it was imported from. This is purely
// additive: it never edits or removes the source Comp Set or its existing
// members.
export function CompSetImportModal({ open, onClose, benchmarkProperties = [], onImported }) {
  const data = useData();
  const toast = useToast();
  const [selectedCompSetIds, setSelectedCompSetIds] = useState([]);

  const compSetsInScope = data.compSets.filter(
    (g) => benchmarkProperties.some((p) => p.id === g.propertyId) && g.status !== "Archived"
  );

  const toggle = (id) => setSelectedCompSetIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const handleClose = () => {
    setSelectedCompSetIds([]);
    onClose();
  };

  // A benchmark property can never contain two competitors with the same
  // name — `existingNamesByProperty` is seeded from current state and grown
  // as this import creates rows, so two selected comp sets that both happen
  // to contain "Grand Palace Resort" don't create two copies of it under the
  // same target property either.
  const handleImport = () => {
    if (selectedCompSetIds.length === 0 || benchmarkProperties.length === 0) return;

    const existingNamesByProperty = new Map();
    data.competitors.forEach((c) => {
      if (c.status === "Archived") return;
      const key = c.propertyId;
      const names = existingNamesByProperty.get(key) || new Set();
      names.add(c.propertyName.trim().toLowerCase());
      existingNamesByProperty.set(key, names);
    });

    let importedCount = 0;
    let skippedCount = 0;
    selectedCompSetIds.forEach((compSetId) => {
      const memberCompetitorIds = data.compSetMemberships.filter((m) => m.compSetId === compSetId).map((m) => m.competitorId);
      const sourceCompetitors = data.competitors.filter((c) => memberCompetitorIds.includes(c.id));
      benchmarkProperties.forEach((property) => {
        const existingNames = existingNamesByProperty.get(property.id) || new Set();
        sourceCompetitors.forEach((source) => {
          const nameKey = source.propertyName.trim().toLowerCase();
          if (existingNames.has(nameKey)) {
            skippedCount += 1;
            return;
          }
          const { id, propertyId, lastModifiedBy, lastModifiedAt, ...rest } = source;
          // Distance is relative to the source's own benchmark property, never
          // valid for a different one, so it's reset rather than copied.
          const created = data.addCompetitor({ ...rest, propertyId: property.id, distance: "" });
          data.addCompSetMembership(compSetId, created.id);
          existingNames.add(nameKey);
          existingNamesByProperty.set(property.id, existingNames);
          importedCount += 1;
        });
      });
    });

    toast.success(
      skippedCount > 0
        ? `Imported: ${importedCount} · Skipped (already exists): ${skippedCount}`
        : `Imported ${importedCount} competitor(s) from ${selectedCompSetIds.length} comp set(s).`
    );
    handleClose();
    onImported?.();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import from an Existing Comp Set"
      size="sm"
      footer={
        <>
          <button className="btn btn--ghost btn--md" type="button" onClick={handleClose}>Cancel</button>
          <Button variant="primary" size="md" onClick={handleImport} disabled={selectedCompSetIds.length === 0}>
            Import {selectedCompSetIds.length || ""} Comp Set{selectedCompSetIds.length === 1 ? "" : "s"}
          </Button>
        </>
      }
    >
      <p className="notes-panel__hint" style={{ marginBottom: 12, display: "flex", gap: 6, alignItems: "flex-start" }}>
        <Info size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
        Every competitor in the selected Comp Set(s) will be cloned as a new, independent Competitor Property record under each
        selected benchmark property, while keeping its association with the original Comp Set.
      </p>

      {compSetsInScope.length === 0 ? (
        <EmptyState
          icon={FolderInput}
          title="No comp sets available"
          message="The selected benchmark propert(y/ies) don't have any active competitive sets to import from yet."
        />
      ) : (
        <div className="master-manager__list">
          {compSetsInScope.map((g) => {
            const memberCount = data.compSetMemberships.filter((m) => m.compSetId === g.id).length;
            const checked = selectedCompSetIds.includes(g.id);
            return (
              <div key={g.id} className="master-manager__row" onClick={() => toggle(g.id)} style={{ cursor: "pointer" }}>
                <Checkbox checked={checked} onChange={() => toggle(g.id)} label={g.name} />
                <span className="master-manager__name">{g.name}</span>
                <span className="table__cell-muted tabular">{memberCount} members</span>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
