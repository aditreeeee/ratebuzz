import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Info, FolderInput } from "lucide-react";
import { Modal, ConfirmModal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Checkbox } from "../../components/ui/Checkbox.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { COMPETITOR_STATUSES, PRIORITY_LEVELS } from "../../mocks/competitors.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { COMPETITOR_GENERAL_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";
import { CompSetImportModal } from "./CompSetImportModal.jsx";

const EMPTY = {
  propertyName: "", country: "", state: "", city: "", address: "",
  website: "", otaUrls: [],
  starRating: 3, distance: "", priority: "Medium", status: "Active", notes: "",
};

// A benchmark property can never contain two competitors with the same name
// (case-insensitive, trimmed) — `targetPropertyIds` is every benchmark
// property this submission would write to, so a multi-property create checks
// all of them and reports which one(s) already have a match.
function validate(form, { existingCompetitors = [], targetPropertyIds = [], excludeId } = {}) {
  const errors = {};
  if (!form.propertyName || !form.propertyName.trim()) errors.propertyName = "Competitor property name is required.";
  if (!form.country || !form.country.trim()) errors.country = "Country is required.";
  if (!form.city || !form.city.trim()) errors.city = "City is required.";
  if (form.website && !/^https?:\/\/.+/i.test(form.website)) errors.website = "Website must start with http:// or https://";
  form.otaUrls.forEach((o, i) => {
    if (o.url && !/^https?:\/\/.+/i.test(o.url)) errors[`otaUrl-${i}`] = "Must start with http:// or https://";
  });

  const name = (form.propertyName || "").trim().toLowerCase();
  if (name) {
    const duplicateIn = targetPropertyIds.filter((propertyId) =>
      existingCompetitors.some(
        (c) => c.propertyId === propertyId && c.status !== "Archived" && c.id !== excludeId && c.propertyName.trim().toLowerCase() === name
      )
    );
    if (duplicateIn.length) {
      errors.propertyName = `A competitor property named "${form.propertyName.trim()}" already exists for this benchmark property.`;
    }
  }
  return errors;
}

// A Competitor Property belongs to exactly one Benchmark Property (unless
// multiple benchmark properties are selected at creation time, in which case
// it's cloned once per property — see `benchmarkPropertyIds` below). There is
// no `futurePropertyId`/"linked property" concept — a competitor can never
// become one of the user's own managed properties; its only identifier is
// its own `id` (Competitor ID), surfaced solely on its Details page.
export function CompetitorForm({ open, onClose, onSubmit, initial, benchmarkProperties = [], existingCompetitors = [] }) {
  // Settings → Configuration Settings → General: prefills a brand-new
  // competitor's Priority.
  const [competitorGeneralDefaults] = usePersistedState("settings.competitors.general", COMPETITOR_GENERAL_DEFAULTS);
  const newCompetitorDefaults = { ...EMPTY, priority: competitorGeneralDefaults.defaultPriority };
  const [form, setForm] = useState(initial || newCompetitorDefaults);
  const [errors, setErrors] = useState({});
  const [benchmarkPropertyIds, setBenchmarkPropertyIds] = useState([]);
  const [importOpen, setImportOpen] = useState(false);
  const baselineRef = useRef(form);

  const isCreate = !initial;
  const showMultiPropertyPicker = isCreate && benchmarkProperties.length > 1;
  // Every benchmark property this submission would write to — used for both
  // duplicate-name validation and (when >1) disabling Distance, since one
  // value can never be correct for more than one benchmark.
  const targetPropertyIds = isCreate
    ? (showMultiPropertyPicker ? benchmarkPropertyIds : benchmarkProperties.map((p) => p.id))
    : (initial?.propertyId ? [initial.propertyId] : []);
  const distanceDisabled = targetPropertyIds.length > 1;

  useEffect(() => {
    const baseline = initial ? { ...EMPTY, ...initial } : newCompetitorDefaults;
    setForm(baseline);
    setErrors({});
    setBenchmarkPropertyIds(benchmarkProperties.map((p) => p.id));
    baselineRef.current = baseline;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  const isDirty = open && JSON.stringify(form) !== JSON.stringify(baselineRef.current);
  const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(isDirty);
  const guardedClose = () => requestAction(onClose);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value === "" ? "" : Number(e.target.value) }));
  const setField = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const addOtaUrl = () => setForm((f) => ({ ...f, otaUrls: [...f.otaUrls, { label: "", url: "" }] }));
  const updateOtaUrl = (i, key, value) =>
    setForm((f) => ({ ...f, otaUrls: f.otaUrls.map((o, idx) => (idx === i ? { ...o, [key]: value } : o)) }));
  const removeOtaUrl = (i) => setForm((f) => ({ ...f, otaUrls: f.otaUrls.filter((_, idx) => idx !== i) }));

  const toggleBenchmarkProperty = (id) =>
    setBenchmarkPropertyIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form, { existingCompetitors, targetPropertyIds, excludeId: initial?.id });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(
      {
        ...form,
        starRating: Number(form.starRating),
        // Distance is relative to a single benchmark property — with more
        // than one target property, no single value is ever correct, so it's
        // cleared here rather than silently reused across benchmarks.
        distance: distanceDisabled || form.distance === "" ? "" : Number(form.distance),
      },
      showMultiPropertyPicker ? benchmarkPropertyIds : null
    );
  };

  return (
    <>
    <Modal
      open={open}
      onClose={guardedClose}
      title={initial ? "Edit Competitor" : "Add Competitor"}
      size="lg"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={guardedClose} type="button">Cancel</button>
          <Button variant="primary" size="md" type="submit" form="competitor-form">
            {initial ? "Save Changes" : "Add Competitor"}
          </Button>
        </>
      }
    >
      {isCreate && (
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <Button type="button" variant="ghost" size="sm" icon={FolderInput} onClick={() => setImportOpen(true)}>
            Import from an existing Comp Set
          </Button>
        </div>
      )}

      <form id="competitor-form" onSubmit={handleSubmit}>
        {showMultiPropertyPicker && (
          <div style={{ marginBottom: "var(--space-6)" }}>
            <span className="field__label">Benchmark Propert{benchmarkPropertyIds.length === 1 ? "y" : "ies"}</span>
            <div className="master-manager__list" style={{ marginTop: 6 }}>
              {benchmarkProperties.map((p) => (
                <div key={p.id} className="master-manager__row" onClick={() => toggleBenchmarkProperty(p.id)} style={{ cursor: "pointer" }}>
                  <Checkbox checked={benchmarkPropertyIds.includes(p.id)} onChange={() => toggleBenchmarkProperty(p.id)} label={p.name} />
                  <span className="master-manager__name">{p.name}</span>
                </div>
              ))}
            </div>
            <p className="notes-panel__hint" style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <Info size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
              This competitor's configuration will be created once per selected benchmark property — each is a fully independent
              Competitor Property record you can edit separately afterward.
            </p>
          </div>
        )}

        <div className="form-grid">
          <div className="form-grid__full">
            <Field label="Competitor Property Name" required id="cmp-name" error={errors.propertyName}>
              <Input id="cmp-name" value={form.propertyName} onChange={set("propertyName")} required placeholder="e.g. Grand Palace Resort" />
            </Field>
          </div>
          <Field label="Star Rating" id="cmp-star">
            <Select id="cmp-star" options={["1", "2", "3", "4", "5"]} value={String(form.starRating)} onChange={(e) => setForm((f) => ({ ...f, starRating: Number(e.target.value) }))} />
          </Field>
          <Field label="Country" required id="cmp-country" error={errors.country}>
            <Input id="cmp-country" value={form.country} onChange={set("country")} required />
          </Field>
          <Field label="State" id="cmp-state">
            <Input id="cmp-state" value={form.state} onChange={set("state")} />
          </Field>
          <Field label="City" required id="cmp-city" error={errors.city}>
            <Input id="cmp-city" value={form.city} onChange={set("city")} required />
          </Field>
          <Field
            label="Distance (from benchmark, km)"
            id="cmp-distance"
            hint={distanceDisabled ? "Distance is specific to each benchmark property — set it individually after creation on each cloned competitor." : undefined}
          >
            <Input id="cmp-distance" type="number" min="0" step="0.1" tabular value={distanceDisabled ? "" : form.distance} onChange={setNum("distance")} disabled={distanceDisabled} placeholder={distanceDisabled ? "Set per property after creation" : ""} />
          </Field>
          <div className="form-grid__full">
            <Field label="Address" id="cmp-address">
              <Input id="cmp-address" value={form.address} onChange={set("address")} />
            </Field>
          </div>
          <div className="form-grid__full">
            <Field label="Website" id="cmp-website" error={errors.website} hint="Used by Source Configuration.">
              <Input id="cmp-website" value={form.website} onChange={set("website")} placeholder="https://..." />
            </Field>
          </div>
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span className="field__label">OTA URLs</span>
            <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addOtaUrl}>Add OTA URL</Button>
          </div>
          {form.otaUrls.length === 0 && <p className="master-manager__hint">No OTA URLs added yet.</p>}
          {form.otaUrls.map((o, i) => (
            <div key={i} className="form-grid" style={{ marginBottom: 8, alignItems: "flex-end" }}>
              <Field label="Label" id={`ota-label-${i}`}>
                <Input id={`ota-label-${i}`} value={o.label} onChange={(e) => updateOtaUrl(i, "label", e.target.value)} placeholder="e.g. Booking.com" />
              </Field>
              <div className="form-grid__full" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <Field label="URL" id={`ota-url-${i}`} error={errors[`otaUrl-${i}`]}>
                    <Input id={`ota-url-${i}`} value={o.url} onChange={(e) => updateOtaUrl(i, "url", e.target.value)} placeholder="https://..." />
                  </Field>
                </div>
                <button type="button" className="table__action-btn table__action-btn--danger" onClick={() => removeOtaUrl(i)} aria-label="Remove OTA URL" style={{ marginBottom: 4 }}>
                  <Trash2 size={15} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <FeatureChipGrid
            label="Priority"
            options={PRIORITY_LEVELS}
            value={form.priority}
            onChange={setField("priority")}
            multiple={false}
          />
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <FeatureChipGrid
            label="Status"
            options={COMPETITOR_STATUSES}
            value={form.status}
            onChange={setField("status")}
            multiple={false}
          />
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <Field label="Notes" id="cmp-notes">
            <Textarea id="cmp-notes" rows={4} value={form.notes} onChange={set("notes")} placeholder="Internal notes about this competitor..." />
          </Field>
        </div>
      </form>
    </Modal>
    <ConfirmModal
      open={confirmOpen}
      onClose={cancelDiscard}
      onConfirm={confirmDiscard}
      title="Unsaved Changes"
      message="You have unsaved changes. Discard them and continue?"
      confirmLabel="Discard Changes"
      danger
    />
    {isCreate && (
      <CompSetImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        benchmarkProperties={benchmarkProperties}
        onImported={() => { setImportOpen(false); guardedClose(); }}
      />
    )}
    </>
  );
}
