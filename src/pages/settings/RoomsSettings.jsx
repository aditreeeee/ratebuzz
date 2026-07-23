import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select, Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { ROOM_STATUSES } from "../../mocks/rooms.js";
import { BED_CONFIGURATIONS } from "../../mocks/roomClassification.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";

const DEFAULTS = { bedConfiguration: BED_CONFIGURATIONS[0], status: ROOM_STATUSES[0], maxOccupancy: 6 };

export function RoomsSettings({ showTitle = true, onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.defaults.rooms", DEFAULTS);
  const { draft, set, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, DEFAULTS, { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        {showTitle && <h3 className="settings-section__title">Rooms</h3>}
        <p className="settings-section__desc">
          Bed Configuration/Status prefill RoomForm when creating a new room. Platform Max Occupancy is enforced there as a hard
          validation cap — a room can never be saved with a maximum occupancy above this value.
        </p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Default Bed Configuration" id="rs-bed">
            <Select id="rs-bed" options={BED_CONFIGURATIONS} value={draft.bedConfiguration} onChange={set("bedConfiguration")} />
          </Field>
          <Field label="Default Status" id="rs-status">
            <Select id="rs-status" options={ROOM_STATUSES} value={draft.status} onChange={set("status")} />
          </Field>
          <Field label="Platform Max Occupancy" id="rs-max">
            <Input id="rs-max" type="number" min="1" tabular value={draft.maxOccupancy} onChange={(e) => set("maxOccupancy")(e.target.value === "" ? "" : Number(e.target.value))} />
          </Field>
          <div className="form-grid__full" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {isDirty && (
              <button className="btn btn--ghost btn--md" type="button" onClick={reset}>
                <RotateCcw size={15} strokeWidth={2} /> Reset Changes
              </button>
            )}
            <Button variant="primary" size="md" icon={Save} type="submit" disabled={!isDirty}>Save Changes</Button>
          </div>
        </form>
      </Card>
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
