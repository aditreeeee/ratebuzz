import React, { useState } from "react";
import { Pencil, Trash2, Plus, Archive, RotateCcw } from "lucide-react";
import { Modal, ConfirmModal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { formatCurrency, formatDate } from "../../lib/format.js";
import { useData } from "../../context/DataContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { RateSeasonForm } from "./RateSeasonForm.jsx";

// Master-data manager for Rate Seasons ("Seasonal Pricing Rules") — the
// reusable templates Rate Plans attach by name (see RatePlanForm's
// Seasonal Pricing section). CRUD goes through DataContext's generic
// masters API, keyed by kind "rateSeasons", exactly like Room Types and
// Amenities — no dedicated reducer case needed.
export function RateSeasonManager({ open, onClose }) {
  const data = useData();
  const toast = useToast();
  const seasons = data.masters.rateSeasons || [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (season) => { setEditing(season); setFormOpen(true); };

  const handleSubmit = (form) => {
    if (editing) {
      data.updateMasterItem("rateSeasons", { ...editing, ...form });
      toast.success(`${form.name} updated.`);
    } else {
      const created = data.addMasterItem("rateSeasons", form);
      toast.success(`${created.name} added.`);
    }
    setFormOpen(false);
  };

  const toggleArchive = (season) => {
    data.updateMasterItem("rateSeasons", { ...season, archived: !season.archived });
    toast.info(season.archived ? `${season.name} restored.` : `${season.name} archived.`);
  };

  const confirmDelete = () => {
    const season = seasons.find((s) => s.id === confirmDeleteId);
    data.deleteMasterItem("rateSeasons", confirmDeleteId);
    toast.success(`${season?.name || "Season"} removed.`);
    setConfirmDeleteId(null);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Manage Rate Seasons" size="md">
        <div className="master-manager">
          <p className="master-manager__hint">
            Reusable seasonal pricing templates (Standard, Peak, Weekend, Festival, Holiday, Event Season).
            Rate Plans reference these by name — default pricing here is master configuration only, not live or historical rates.
          </p>

          {seasons.length === 0 ? (
            <EmptyState title="No rate seasons yet" message="Add a season template that rate plans can reference." />
          ) : (
            <div className="master-manager__list">
              {seasons.map((season) => (
                <div key={season.id} className="master-manager__row" style={{ alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span className="master-manager__name">{season.name}</span>
                      <Badge variant="info">{season.category}</Badge>
                      {season.archived && <Badge variant="danger">Archived</Badge>}
                    </div>
                    <div className="master-manager__hint" style={{ margin: "4px 0 0" }}>
                      {season.hasDefaultPricing
                        ? `Default base ${formatCurrency(season.defaultBaseRate, season.currency)} · weekend ${formatCurrency(season.defaultWeekendRate, season.currency)}`
                        : "No default pricing set"}
                      {season.hasValidityRange && ` · Valid ${formatDate(season.validFrom)} – ${formatDate(season.validTo)}`}
                    </div>
                  </div>
                  <button type="button" className="master-manager__icon-btn" onClick={() => openEdit(season)} aria-label={`Edit ${season.name}`}>
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                  <button type="button" className="master-manager__icon-btn" onClick={() => toggleArchive(season)} aria-label={season.archived ? `Restore ${season.name}` : `Archive ${season.name}`}>
                    {season.archived ? <RotateCcw size={14} strokeWidth={2} /> : <Archive size={14} strokeWidth={2} />}
                  </button>
                  <button type="button" className="master-manager__icon-btn master-manager__icon-btn--danger" onClick={() => setConfirmDeleteId(season.id)} aria-label={`Delete ${season.name}`}>
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button variant="secondary" size="sm" icon={Plus} onClick={openCreate} className="master-manager__add">
            Add Rate Season
          </Button>
        </div>
      </Modal>

      <RateSeasonForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <ConfirmModal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Rate Season"
        message="This will remove the season template. Rate plans already referencing it keep the name as free text until re-assigned."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
