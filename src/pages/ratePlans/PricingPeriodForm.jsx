import React, { useState, useEffect, useRef } from "react";
import { Modal, ConfirmModal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { CURRENCIES } from "../../mocks/properties.js";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges.js";

function buildEmpty(defaultCurrency) {
  return {
    effectiveFrom: "", effectiveTo: "",
    baseRate: 0, weekendRate: 0, childRate: 0, extraAdultRate: 0,
    currency: defaultCurrency || CURRENCIES[0],
    archived: false,
  };
}

function validate(form) {
  const errors = {};
  if (!form.effectiveFrom) errors.effectiveFrom = "Effective from date is required.";
  if (!form.effectiveTo) errors.effectiveTo = "Effective to date is required.";
  if (form.effectiveFrom && form.effectiveTo && form.effectiveTo < form.effectiveFrom) {
    errors.effectiveTo = "Effective to date must be on or after the effective from date.";
  }
  for (const [key, label] of [
    ["baseRate", "Base rate"],
    ["weekendRate", "Weekend rate"],
    ["childRate", "Child rate"],
    ["extraAdultRate", "Extra adult rate"],
  ]) {
    const val = form[key];
    if (val === "" || val === null || Number.isNaN(Number(val))) errors[key] = `${label} must be a number.`;
    else if (Number(val) < 0) errors[key] = `${label} cannot be negative.`;
  }
  return errors;
}

export function PricingPeriodForm({ open, onClose, onSubmit, initial, defaultCurrency }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit({
      ...form,
      baseRate: Number(form.baseRate), weekendRate: Number(form.weekendRate),
      childRate: Number(form.childRate), extraAdultRate: Number(form.extraAdultRate),
    });
  };

  return (
    <>
    <Modal
      open={open}
      onClose={guardedClose}
      title={initial ? "Edit Pricing Period" : "Add Pricing Period"}
      size="md"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={guardedClose} type="button">Cancel</button>
          <Button variant="primary" size="md" type="submit" form="pricing-period-form">
            {initial ? "Save Changes" : "Add Period"}
          </Button>
        </>
      }
    >
      <form id="pricing-period-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field label="Effective From" required id="pp-from" error={errors.effectiveFrom}>
            <Input id="pp-from" type="date" tabular value={form.effectiveFrom} onChange={set("effectiveFrom")} required />
          </Field>
          <Field label="Effective To" required id="pp-to" error={errors.effectiveTo}>
            <Input id="pp-to" type="date" tabular value={form.effectiveTo} onChange={set("effectiveTo")} required />
          </Field>
          <Field label="Currency" required id="pp-currency">
            <Select id="pp-currency" options={CURRENCIES} value={form.currency} onChange={set("currency")} />
          </Field>
          <Field label="Base Rate" required id="pp-base" error={errors.baseRate}>
            <Input id="pp-base" type="number" min="0" step="0.01" tabular value={form.baseRate} onChange={setNum("baseRate")} required />
          </Field>
          <Field label="Weekend Rate" required id="pp-weekend" error={errors.weekendRate}>
            <Input id="pp-weekend" type="number" min="0" step="0.01" tabular value={form.weekendRate} onChange={setNum("weekendRate")} required />
          </Field>
          <Field label="Child Rate" id="pp-child" error={errors.childRate}>
            <Input id="pp-child" type="number" min="0" step="0.01" tabular value={form.childRate} onChange={setNum("childRate")} />
          </Field>
          <Field label="Extra Adult Rate" id="pp-extra-adult" error={errors.extraAdultRate}>
            <Input id="pp-extra-adult" type="number" min="0" step="0.01" tabular value={form.extraAdultRate} onChange={setNum("extraAdultRate")} />
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
    </>
  );
}
