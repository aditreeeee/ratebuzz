import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { BED_TYPES, VIEWS, ROOM_STATUSES } from "../../mocks/rooms.js";
import { ROOM_TEMPLATES } from "../../mocks/roomTemplates.js";

const EMPTY = {
  name: "", description: "", occupancy: 2, maxAdults: 2, maxChildren: 0,
  bedType: BED_TYPES[0], view: VIEWS[0], smoking: false, status: "Active",
};

function validate(form) {
  const errors = {};
  if (!form.name || !form.name.trim()) errors.name = "Room name is required.";
  for (const [key, label] of [
    ["occupancy", "Occupancy"],
    ["maxAdults", "Max adults"],
    ["maxChildren", "Max children"],
  ]) {
    const val = form[key];
    if (val === "" || val === null || Number.isNaN(Number(val))) errors[key] = `${label} must be a number.`;
    else if (Number(val) < (key === "occupancy" ? 1 : 0)) errors[key] = `${label} must be ${key === "occupancy" ? "at least 1" : "0 or more"}.`;
  }
  if (!errors.occupancy && !errors.maxAdults && !errors.maxChildren) {
    if (Number(form.occupancy) > Number(form.maxAdults) + Number(form.maxChildren)) {
      errors.occupancy = "Occupancy cannot exceed max adults + max children.";
    }
  }
  return errors;
}

export function RoomForm({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => { setForm(initial || EMPTY); setErrors({}); }, [initial, open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNum = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value === "" ? "" : Number(e.target.value) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Room" : "Add Room"}
      size="lg"
      footer={
        <>
          <button className="btn btn--ghost btn--md" onClick={onClose} type="button">Cancel</button>
          <Button variant="primary" size="md" type="submit" form="room-form">
            {initial ? "Save Changes" : "Create Room"}
          </Button>
        </>
      }
    >
      {!initial && (
        <div className="template-picker">
          <div className="template-picker__label"><Sparkles size={13} strokeWidth={2} /> Quick-fill from a template</div>
          <div className="template-picker__list">
            {ROOM_TEMPLATES.map((t) => (
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
      <form id="room-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-grid__full">
            <Field label="Room Name" required id="r-name" error={errors.name}>
              <Input id="r-name" value={form.name} onChange={set("name")} required placeholder="e.g. Deluxe Ocean King" />
            </Field>
          </div>
          <div className="form-grid__full">
            <Field label="Description" id="r-desc">
              <Textarea id="r-desc" value={form.description} onChange={set("description")} />
            </Field>
          </div>
          <Field label="Occupancy" required id="r-occ" error={errors.occupancy}>
            <Input id="r-occ" type="number" min="1" tabular value={form.occupancy} onChange={setNum("occupancy")} required />
          </Field>
          <Field label="Bed Type" required id="r-bed">
            <Select id="r-bed" options={BED_TYPES} value={form.bedType} onChange={set("bedType")} />
          </Field>
          <Field label="Max Adults" required id="r-adults" error={errors.maxAdults}>
            <Input id="r-adults" type="number" min="0" tabular value={form.maxAdults} onChange={setNum("maxAdults")} required />
          </Field>
          <Field label="Max Children" required id="r-children" error={errors.maxChildren}>
            <Input id="r-children" type="number" min="0" tabular value={form.maxChildren} onChange={setNum("maxChildren")} required />
          </Field>
          <Field label="View" required id="r-view">
            <Select id="r-view" options={VIEWS} value={form.view} onChange={set("view")} />
          </Field>
          <Field label="Status" required id="r-status">
            <Select id="r-status" options={ROOM_STATUSES} value={form.status} onChange={set("status")} />
          </Field>
          <Field label="Smoking" id="r-smoking">
            <Select
              id="r-smoking"
              options={["No", "Yes"]}
              value={form.smoking ? "Yes" : "No"}
              onChange={(e) => setForm((f) => ({ ...f, smoking: e.target.value === "Yes" }))}
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
