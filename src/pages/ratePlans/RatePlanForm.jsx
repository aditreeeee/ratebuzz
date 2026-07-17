import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { MEAL_PLANS, CANCELLATION_POLICIES, RATE_PLAN_STATUSES } from "../../mocks/ratePlans.js";
import { RATE_PLAN_TEMPLATES } from "../../mocks/ratePlanTemplates.js";

const EMPTY = {
  name: "", mealPlan: MEAL_PLANS[0], cancellationPolicy: CANCELLATION_POLICIES[0],
  basePrice: 0, weekendPrice: 0, extraAdultPrice: 0, childPrice: 0,
  validFrom: "", validTo: "", status: "Active",
};

export function RatePlanForm({ open, onClose, onSubmit, initial, roomLabel }) {
  const [form, setForm] = useState(initial || EMPTY);

  useEffect(() => { setForm(initial || EMPTY); }, [initial, open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Rate Plan" : "Add Rate Plan"}
      size="lg"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={onClose} type="button">Cancel</button>
          <Button variant="primary" size="md" type="submit" form="rp-form">
            {initial ? "Save Changes" : "Create Rate Plan"}
          </Button>
        </>
      }
    >
      {roomLabel && (
        <div className="rp-form__room-context">
          Linked Room: <strong>{roomLabel}</strong>
        </div>
      )}
      {!initial && (
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
        <div className="form-grid">
          <div className="form-grid__full">
            <Field label="Rate Plan Name" required id="rp-name">
              <Input id="rp-name" value={form.name} onChange={set("name")} required placeholder="e.g. Best Flexible Rate" />
            </Field>
          </div>
          <Field label="Meal Plan" required id="rp-meal">
            <Select id="rp-meal" options={MEAL_PLANS} value={form.mealPlan} onChange={set("mealPlan")} />
          </Field>
          <Field label="Cancellation Policy" required id="rp-cancel">
            <Select id="rp-cancel" options={CANCELLATION_POLICIES} value={form.cancellationPolicy} onChange={set("cancellationPolicy")} />
          </Field>
          <Field label="Base Price" required id="rp-base">
            <Input id="rp-base" type="number" min="0" step="0.01" tabular value={form.basePrice} onChange={setNum("basePrice")} required />
          </Field>
          <Field label="Weekend Price" required id="rp-weekend">
            <Input id="rp-weekend" type="number" min="0" step="0.01" tabular value={form.weekendPrice} onChange={setNum("weekendPrice")} required />
          </Field>
          <Field label="Extra Adult Price" id="rp-extra-adult">
            <Input id="rp-extra-adult" type="number" min="0" step="0.01" tabular value={form.extraAdultPrice} onChange={setNum("extraAdultPrice")} />
          </Field>
          <Field label="Child Price" id="rp-child">
            <Input id="rp-child" type="number" min="0" step="0.01" tabular value={form.childPrice} onChange={setNum("childPrice")} />
          </Field>
          <Field label="Valid From" required id="rp-from">
            <Input id="rp-from" type="date" tabular value={form.validFrom} onChange={set("validFrom")} required />
          </Field>
          <Field label="Valid To" required id="rp-to">
            <Input id="rp-to" type="date" tabular value={form.validTo} onChange={set("validTo")} required />
          </Field>
          <Field label="Status" required id="rp-status">
            <Select id="rp-status" options={RATE_PLAN_STATUSES} value={form.status} onChange={set("status")} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
