import React, { useState, useEffect } from "react";
import { Modal } from "../../components/ui/Modal.jsx";
import { Field, Input, Select, Textarea } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { BED_TYPES, VIEWS, ROOM_STATUSES } from "../../mocks/rooms.js";

const EMPTY = {
  name: "", description: "", occupancy: 2, maxAdults: 2, maxChildren: 0,
  bedType: BED_TYPES[0], view: VIEWS[0], smoking: false, status: "Active",
};

export function RoomForm({ open, onClose, onSubmit, initial }) {
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
      <form id="room-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-grid__full">
            <Field label="Room Name" required id="r-name">
              <Input id="r-name" value={form.name} onChange={set("name")} required placeholder="e.g. Deluxe Ocean King" />
            </Field>
          </div>
          <div className="form-grid__full">
            <Field label="Description" id="r-desc">
              <Textarea id="r-desc" value={form.description} onChange={set("description")} />
            </Field>
          </div>
          <Field label="Occupancy" required id="r-occ">
            <Input id="r-occ" type="number" min="1" tabular value={form.occupancy} onChange={setNum("occupancy")} required />
          </Field>
          <Field label="Bed Type" required id="r-bed">
            <Select id="r-bed" options={BED_TYPES} value={form.bedType} onChange={set("bedType")} />
          </Field>
          <Field label="Max Adults" required id="r-adults">
            <Input id="r-adults" type="number" min="0" tabular value={form.maxAdults} onChange={setNum("maxAdults")} required />
          </Field>
          <Field label="Max Children" required id="r-children">
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
