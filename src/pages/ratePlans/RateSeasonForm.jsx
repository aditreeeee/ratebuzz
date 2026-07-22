import React, { useState, useEffect, useRef } from "react";
import { Modal, ConfirmModal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { CURRENCIES } from "../../mocks/properties.js";
import { RATE_SEASON_CATEGORIES } from "../../mocks/masterData.js";
import { rateSeasonIcon } from "../../lib/rateSeasonIcons.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";

function buildEmpty(defaultCurrency) {
  return {
    name: "", category: RATE_SEASON_CATEGORIES[0],
    hasDefaultPricing: false,
    defaultBaseRate: 0, defaultWeekendRate: 0, defaultChildRate: 0, defaultExtraAdultRate: 0,
    currency: defaultCurrency || CURRENCIES[0],
    hasValidityRange: false, validFrom: "", validTo: "",
    archived: false,
  };
}

function validate(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) errors.name = "Season name is required.";
  if (form.hasDefaultPricing) {
    for (const [key, label] of [
      ["defaultBaseRate", "Default base rate"],
      ["defaultWeekendRate", "Default weekend rate"],
      ["defaultChildRate", "Default child rate"],
      ["defaultExtraAdultRate", "Default extra adult rate"],
    ]) {
      const val = form[key];
      if (val === "" || val === null || Number.isNaN(Number(val))) errors[key] = `${label} must be a number.`;
      else if (Number(val) < 0) errors[key] = `${label} cannot be negative.`;
    }
  }
  if (form.hasValidityRange) {
    if (!form.validFrom) errors.validFrom = "Valid from date is required.";
    if (!form.validTo) errors.validTo = "Valid to date is required.";
    if (form.validFrom && form.validTo && form.validTo < form.validFrom) {
      errors.validTo = "Valid to date must be on or after the valid from date.";
    }
  }
  return errors;
}

// A Rate Season is a reusable master template ("Seasonal Pricing Rule") —
// e.g. Standard, Peak, Weekend, Festival, Holiday, Event Season — that Rate
// Plans reference by name instead of duplicating. Default pricing and a
// validity range are both optional and purely indicative master
// configuration; this form intentionally has no way to record historical or
// live pricing — that belongs to Phase 3, which will attach scraped rate
// observations against these same season definitions.
export function RateSeasonForm({ open, onClose, onSubmit, initial, defaultCurrency }) {
  const [form, setForm] = useState(initial || buildEmpty(defaultCurrency));
  const [errors, setErrors] = useState({});
  const baselineRef = useRef(form);

  useEffect(() => {
    const baseline = initial ? { ...buildEmpty(defaultCurrency), ...initial } : buildEmpty(defaultCurrency);
    setForm(baseline);
    setErrors({});
    baselineRef.current = baseline;
  }, [initial, open, defaultCurrency]);

  const isDirty = open && JSON.stringify(form) !== JSON.stringify(baselineRef.current);
  const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(isDirty);
  const guardedClose = () => requestAction(onClose);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value === "" ? "" : Number(e.target.value) }));
  const setField = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit({
      ...form,
      defaultBaseRate: Number(form.defaultBaseRate), defaultWeekendRate: Number(form.defaultWeekendRate),
      defaultChildRate: Number(form.defaultChildRate), defaultExtraAdultRate: Number(form.defaultExtraAdultRate),
    });
  };

  return (
    <>
    <Modal
      open={open}
      onClose={guardedClose}
      title={initial ? "Edit Rate Season" : "Add Rate Season"}
      size="md"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={guardedClose} type="button">Cancel</button>
          <Button variant="primary" size="md" type="submit" form="rate-season-form">
            {initial ? "Save Changes" : "Add Season"}
          </Button>
        </>
      }
    >
      <form id="rate-season-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-grid__full">
            <Field label="Season Name" required id="rs-name" error={errors.name}>
              <Input id="rs-name" value={form.name} onChange={set("name")} required placeholder="e.g. Peak Season" />
            </Field>
          </div>
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <FeatureChipGrid
            label="Category"
            options={RATE_SEASON_CATEGORIES}
            value={form.category}
            onChange={setField("category")}
            multiple={false}
            getIcon={rateSeasonIcon}
            hint="Groups this season for reporting and filtering; the name can be more specific (e.g. “Diwali Festival”)."
          />
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <FeatureChipGrid
            label="Include Default Pricing"
            options={["No", "Yes"]}
            value={form.hasDefaultPricing ? "Yes" : "No"}
            onChange={(v) => setForm((f) => ({ ...f, hasDefaultPricing: v === "Yes" }))}
            multiple={false}
            hint="Optional master reference rates for rate plans that use this season. Not live or historical pricing."
          />
        </div>

        {form.hasDefaultPricing && (
          <div className="form-grid" style={{ marginTop: "var(--space-6)" }}>
            <Field label="Currency" required id="rs-currency">
              <Select id="rs-currency" options={CURRENCIES} value={form.currency} onChange={set("currency")} />
            </Field>
            <Field label="Default Base Rate" required id="rs-base" error={errors.defaultBaseRate}>
              <Input id="rs-base" type="number" min="0" step="0.01" tabular value={form.defaultBaseRate} onChange={setNum("defaultBaseRate")} required />
            </Field>
            <Field label="Default Weekend Rate" required id="rs-weekend" error={errors.defaultWeekendRate}>
              <Input id="rs-weekend" type="number" min="0" step="0.01" tabular value={form.defaultWeekendRate} onChange={setNum("defaultWeekendRate")} required />
            </Field>
            <Field label="Default Child Rate" id="rs-child" error={errors.defaultChildRate}>
              <Input id="rs-child" type="number" min="0" step="0.01" tabular value={form.defaultChildRate} onChange={setNum("defaultChildRate")} />
            </Field>
            <Field label="Default Extra Adult Rate" id="rs-extra-adult" error={errors.defaultExtraAdultRate}>
              <Input id="rs-extra-adult" type="number" min="0" step="0.01" tabular value={form.defaultExtraAdultRate} onChange={setNum("defaultExtraAdultRate")} />
            </Field>
          </div>
        )}

        <div style={{ marginTop: "var(--space-6)" }}>
          <FeatureChipGrid
            label="Limit Validity Range"
            options={["No", "Yes"]}
            value={form.hasValidityRange ? "Yes" : "No"}
            onChange={(v) => setForm((f) => ({ ...f, hasValidityRange: v === "Yes" }))}
            multiple={false}
            hint="Optional date range this season template applies to (e.g. a fixed festival window). Leave off for standing seasons like Standard or Weekend."
          />
        </div>

        {form.hasValidityRange && (
          <div className="form-grid" style={{ marginTop: "var(--space-6)" }}>
            <Field label="Valid From" required id="rs-from" error={errors.validFrom}>
              <Input id="rs-from" type="date" tabular value={form.validFrom} onChange={set("validFrom")} required />
            </Field>
            <Field label="Valid To" required id="rs-to" error={errors.validTo}>
              <Input id="rs-to" type="date" tabular value={form.validTo} onChange={set("validTo")} required />
            </Field>
          </div>
        )}
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
    </>
  );
}
