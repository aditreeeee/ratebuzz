import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sparkles, LayoutGrid, UtensilsCrossed, Ban, Percent,
  Check, AlertCircle, RotateCcw,
} from "lucide-react";
import { Modal, ConfirmModal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { RoomClassificationSummary } from "../../components/ui/RoomClassificationSummary.jsx";
import { ratePlanFeatureIcon } from "../../lib/ratePlanFeatureIcons.js";
import { MEAL_PLANS, CANCELLATION_POLICIES, RATE_PLAN_STATUSES, mealPlanLabel } from "../../mocks/ratePlans.js";
import { RATE_PLAN_TEMPLATES } from "../../mocks/ratePlanTemplates.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";

// pricingPeriods is intentionally never edited here — it's managed on the
// Rate Plan Profile page's Pricing Periods tab. Keeping the key in EMPTY
// just ensures baseline spreading ({...EMPTY, ...initial}) always preserves
// whatever periods already exist through an edit/submit round-trip.
const REFUND_UNTIL_UNITS = ["Hours", "Days"];

const EMPTY = {
  name: "", mealPlan: MEAL_PLANS[0], cancellationPolicy: CANCELLATION_POLICIES[0],
  status: "Draft", roomId: "", taxInclusive: false, taxPercent: 0, pricingPeriods: [],
  partialRefundAllowed: false, refundPercent: 50, refundUntilValue: 24, refundUntilUnit: REFUND_UNTIL_UNITS[0],
};

function validate(form) {
  const errors = {};
  if (!form.roomId) errors.roomId = "Room is required.";
  if (!form.name || !form.name.trim()) errors.name = "Rate plan name is required.";
  if (form.taxPercent === "" || form.taxPercent === null || Number.isNaN(Number(form.taxPercent))) {
    errors.taxPercent = "Tax percent must be a number.";
  } else if (Number(form.taxPercent) < 0) {
    errors.taxPercent = "Tax percent cannot be negative.";
  }
  if (form.partialRefundAllowed) {
    if (form.refundPercent === "" || form.refundPercent === null || Number.isNaN(Number(form.refundPercent))) {
      errors.refundPercent = "Refund percentage must be a number.";
    } else if (Number(form.refundPercent) < 0 || Number(form.refundPercent) > 100) {
      errors.refundPercent = "Refund percentage must be between 0 and 100.";
    }
    if (form.refundUntilValue === "" || form.refundUntilValue === null || Number.isNaN(Number(form.refundUntilValue))) {
      errors.refundUntilValue = "Refund window must be a number.";
    } else if (Number(form.refundUntilValue) < 0) {
      errors.refundUntilValue = "Refund window cannot be negative.";
    }
  }
  return errors;
}

const SECTION_FIELDS = {
  overview: ["roomId", "name", "status"],
  mealPlan: ["mealPlan"],
  cancellation: ["cancellationPolicy", "partialRefundAllowed", "refundPercent", "refundUntilValue", "refundUntilUnit"],
  taxes: ["taxInclusive", "taxPercent"],
};

const SECTIONS = [
  { key: "overview", label: "Overview", icon: LayoutGrid },
  { key: "mealPlan", label: "Meal Plan", icon: UtensilsCrossed },
  { key: "cancellation", label: "Cancellation Policy", icon: Ban },
  { key: "taxes", label: "Taxes & Fees", icon: Percent },
];

export function RatePlanForm({ open, onClose, onSubmit, initial, roomLabel, rooms = [], allRooms = [], scopeRoomId }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});
  const [active, setActive] = useState("overview");
  const baselineRef = useRef(EMPTY);

  useEffect(() => {
    const baseline = initial
      ? { ...EMPTY, ...initial }
      : { ...EMPTY, roomId: scopeRoomId || "" };
    setForm(baseline);
    setErrors({});
    setActive("overview");
    baselineRef.current = baseline;
  }, [initial, open, scopeRoomId]);

  const scopedRoom = rooms.find((r) => r.id === form.roomId);

  const isDirty = open && JSON.stringify(form) !== JSON.stringify(baselineRef.current);
  const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(isDirty);
  const guardedClose = () => requestAction(onClose);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value === "" ? "" : Number(e.target.value) }));
  const setField = (key) => (v) => setForm((f) => ({ ...f, [key]: v }));

  const dirtyFields = useMemo(() => {
    const s = new Set();
    for (const key of Object.keys(form)) {
      if (JSON.stringify(form[key]) !== JSON.stringify(baselineRef.current[key])) s.add(key);
    }
    return s;
  }, [form]);

  const sectionHasError = (key) => (SECTION_FIELDS[key] || []).some((f) => errors[f]);
  const isSectionComplete = (key) => {
    if (sectionHasError(key)) return false;
    if (key === "overview") return !!form.roomId && !!form.name.trim();
    return true;
  };

  const runValidation = () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorSection = SECTIONS.find((s) => (SECTION_FIELDS[s.key] || []).some((f) => validationErrors[f]));
      if (firstErrorSection) setActive(firstErrorSection.key);
      return null;
    }
    return {
      ...form,
      taxPercent: Number(form.taxPercent),
      refundPercent: form.partialRefundAllowed ? Number(form.refundPercent) : form.refundPercent,
      refundUntilValue: form.partialRefundAllowed ? Number(form.refundUntilValue) : form.refundUntilValue,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = runValidation();
    if (!valid) return;
    onSubmit(valid);
  };

  const handleSaveAndContinue = (e) => {
    e.preventDefault();
    const valid = runValidation();
    if (!valid) return;
    onSubmit(valid, { keepOpen: true });
    baselineRef.current = valid;
    const idx = SECTIONS.findIndex((s) => s.key === active);
    const next = SECTIONS[(idx + 1) % SECTIONS.length];
    if (next) setActive(next.key);
  };

  const handleReset = () => setForm(baselineRef.current);

  return (
    <>
    <Modal
      open={open}
      onClose={guardedClose}
      title={initial ? "Edit Rate Plan" : "Add Rate Plan"}
      size="full"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={guardedClose} type="button">Cancel</button>
          {isDirty && (
            <button className="btn btn--ghost btn--md" onClick={handleReset} type="button">
              <RotateCcw size={15} strokeWidth={2} /> Reset Changes
            </button>
          )}
          {initial && (
            <Button variant="secondary" size="md" onClick={handleSaveAndContinue} type="button">
              Save &amp; Continue
            </Button>
          )}
          <Button variant="primary" size="md" type="submit" form="rp-form">
            {initial ? "Save Changes" : "Create Rate Plan"}
          </Button>
        </>
      }
    >
      <div className="entity-wizard">
        <nav className="entity-wizard__nav">
          {SECTIONS.map((s) => {
            const complete = isSectionComplete(s.key);
            const hasError = sectionHasError(s.key);
            return (
              <button
                key={s.key}
                type="button"
                className={`entity-wizard__nav-item ${active === s.key ? "entity-wizard__nav-item--active" : ""} ${hasError ? "entity-wizard__nav-item--error" : ""}`}
                onClick={() => setActive(s.key)}
              >
                <span className="entity-wizard__nav-icon">
                  {hasError ? <AlertCircle size={16} strokeWidth={2} /> : complete ? <Check size={16} strokeWidth={2.5} /> : <s.icon size={16} strokeWidth={2} />}
                </span>
                <span className="entity-wizard__nav-label">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="entity-wizard__content">
          {active === "overview" && scopeRoomId && roomLabel && (
            <div className="rp-form__room-context">
              Linked Room: <strong>{roomLabel}</strong>
            </div>
          )}
          {active === "overview" && form.roomId && (
            <RoomClassificationSummary room={allRooms.find((r) => r.id === form.roomId)} />
          )}
          {active === "overview" && !initial && (
            <div className="template-picker">
              <div className="template-picker__label"><Sparkles size={13} strokeWidth={2} /> Quick-fill from a template</div>
              <div className="template-picker__list">
                {RATE_PLAN_TEMPLATES.map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    className="template-picker__item"
                    onClick={() => setForm((f) => ({ ...f, ...t.values }))}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form id="rp-form" onSubmit={handleSubmit}>
            {active === "overview" && (
              <div className="form-grid">
                {!scopeRoomId && (
                  <div className="form-grid__full">
                    <Field label="Room" required id="rp-room" error={errors.roomId}>
                      <Select
                        id="rp-room"
                        placeholder="Select a room"
                        options={rooms.map((r) => r.label)}
                        value={scopedRoom ? scopedRoom.label : ""}
                        onChange={(e) => {
                          const r = rooms.find((rr) => rr.label === e.target.value);
                          setForm((f) => ({ ...f, roomId: r?.id || "" }));
                        }}
                        disabled={!!initial}
                      />
                    </Field>
                  </div>
                )}
                <div className="form-grid__full">
                  <Field label="Rate Plan Name" required id="rp-name" error={errors.name} modified={dirtyFields.has("name")}>
                    <Input id="rp-name" value={form.name} onChange={set("name")} required placeholder="e.g. Best Flexible Rate" />
                  </Field>
                </div>
                <FeatureChipGrid
                  label="Status"
                  options={RATE_PLAN_STATUSES}
                  value={form.status}
                  onChange={setField("status")}
                  multiple={false}
                  getIcon={ratePlanFeatureIcon}
                  resetValue={baselineRef.current.status}
                />
              </div>
            )}

            {active === "mealPlan" && (
              <FeatureChipGrid
                label="Meal Plan"
                options={MEAL_PLANS}
                value={form.mealPlan}
                onChange={setField("mealPlan")}
                multiple={false}
                getIcon={ratePlanFeatureIcon}
                resetValue={baselineRef.current.mealPlan}
                hint={mealPlanLabel(form.mealPlan)}
              />
            )}

            {active === "cancellation" && (
              <>
                <FeatureChipGrid
                  label="Cancellation Policy"
                  options={CANCELLATION_POLICIES}
                  value={form.cancellationPolicy}
                  onChange={setField("cancellationPolicy")}
                  multiple={false}
                  getIcon={ratePlanFeatureIcon}
                  resetValue={baselineRef.current.cancellationPolicy}
                />
                <div style={{ marginTop: "var(--space-6)" }}>
                  <FeatureChipGrid
                    label="Partial Refund"
                    options={["No", "Yes"]}
                    value={form.partialRefundAllowed ? "Yes" : "No"}
                    onChange={(v) => setForm((f) => ({ ...f, partialRefundAllowed: v === "Yes" }))}
                    multiple={false}
                    getIcon={ratePlanFeatureIcon}
                    resetValue={baselineRef.current.partialRefundAllowed ? "Yes" : "No"}
                    hint="Whether guests can receive a partial refund when cancelling within the policy window."
                  />
                </div>
                {form.partialRefundAllowed && (
                  <div className="form-grid" style={{ marginTop: "var(--space-6)" }}>
                    <Field label="Refund Percentage (%)" required id="rp-refund-percent" error={errors.refundPercent} modified={dirtyFields.has("refundPercent")}>
                      <Input id="rp-refund-percent" type="number" min="0" max="100" step="1" tabular value={form.refundPercent} onChange={setNum("refundPercent")} required />
                    </Field>
                    <Field label="Refund Until" required id="rp-refund-until" error={errors.refundUntilValue} modified={dirtyFields.has("refundUntilValue")}>
                      <Input id="rp-refund-until" type="number" min="0" step="1" tabular value={form.refundUntilValue} onChange={setNum("refundUntilValue")} required />
                    </Field>
                    <Field label="Unit" id="rp-refund-unit" modified={dirtyFields.has("refundUntilUnit")}>
                      <Select id="rp-refund-unit" options={REFUND_UNTIL_UNITS} value={form.refundUntilUnit} onChange={set("refundUntilUnit")} />
                    </Field>
                  </div>
                )}
              </>
            )}

            {active === "taxes" && (
              <>
                <FeatureChipGrid
                  label="Tax Inclusive"
                  options={["No", "Yes"]}
                  value={form.taxInclusive ? "Yes" : "No"}
                  onChange={(v) => setForm((f) => ({ ...f, taxInclusive: v === "Yes" }))}
                  multiple={false}
                  getIcon={ratePlanFeatureIcon}
                  resetValue={baselineRef.current.taxInclusive ? "Yes" : "No"}
                  hint="Whether displayed rates already include tax, or tax is added at checkout."
                />
                <div className="form-grid" style={{ marginTop: "var(--space-6)" }}>
                  <Field label="Tax Percent" required id="rp-tax-percent" error={errors.taxPercent} modified={dirtyFields.has("taxPercent")}>
                    <Input id="rp-tax-percent" type="number" min="0" step="0.1" tabular value={form.taxPercent} onChange={setNum("taxPercent")} required />
                  </Field>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
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
