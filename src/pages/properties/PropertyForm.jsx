import React, { useState } from "react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { BRANDS, CURRENCIES, TIME_ZONES, STATUSES, PROPERTY_TYPES } from "../../mocks/properties.js";

const EMPTY = {
  name: "", brand: BRANDS[0], country: "", state: "", city: "",
  currency: CURRENCIES[0], timeZone: TIME_ZONES[0], starRating: 3,
  propertyType: PROPERTY_TYPES[0], status: "Active", description: "",
};

export function PropertyForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || EMPTY);

  React.useEffect(() => {
    setForm(initial || EMPTY);
  }, [initial, open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, starRating: Number(form.starRating) });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Property" : "Add Property"}
      size="lg"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={onClose} type="button">Cancel</button>
          <Button variant="primary" size="md" onClick={handleSubmit} type="submit" form="property-form">
            {initial ? "Save Changes" : "Create Property"}
          </Button>
        </>
      }
    >
      <form id="property-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <Field label="Property Name" required id="p-name">
            <Input id="p-name" value={form.name} onChange={set("name")} required placeholder="e.g. Aurora Bay Resort" />
          </Field>
          <Field label="Brand" required id="p-brand">
            <Select id="p-brand" options={BRANDS} value={form.brand} onChange={set("brand")} />
          </Field>
          <Field label="Country" required id="p-country">
            <Input id="p-country" value={form.country} onChange={set("country")} required />
          </Field>
          <Field label="State / Region" id="p-state">
            <Input id="p-state" value={form.state} onChange={set("state")} />
          </Field>
          <Field label="City" required id="p-city">
            <Input id="p-city" value={form.city} onChange={set("city")} required />
          </Field>
          <Field label="Currency" required id="p-currency">
            <Select id="p-currency" options={CURRENCIES} value={form.currency} onChange={set("currency")} />
          </Field>
          <Field label="Time Zone" required id="p-tz">
            <Select id="p-tz" options={TIME_ZONES} value={form.timeZone} onChange={set("timeZone")} />
          </Field>
          <Field label="Star Rating" required id="p-star">
            <Select id="p-star" options={["1", "2", "3", "4", "5"]} value={String(form.starRating)} onChange={set("starRating")} />
          </Field>
          <Field label="Property Type" required id="p-type">
            <Select id="p-type" options={PROPERTY_TYPES} value={form.propertyType} onChange={set("propertyType")} />
          </Field>
          <Field label="Status" required id="p-status">
            <Select id="p-status" options={STATUSES} value={form.status} onChange={set("status")} />
          </Field>
          <div className="form-grid__full">
            <Field label="Description" id="p-desc">
              <Textarea id="p-desc" value={form.description} onChange={set("description")} placeholder="Brief property description..." />
            </Field>
          </div>
        </div>
      </form>
    </Modal>
  );
}
