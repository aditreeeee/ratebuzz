import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { useAppSettings } from "../../context/AppSettingsContext.jsx";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { APP_SETTINGS_DEFAULTS } from "../../lib/appSettingsStore.js";

const PAGE_SIZES = ["5", "10", "20", "50"];

// Both fields are read live by the Rooms/Rate Plans/Competitors/Comp Sets
// list pages — Rows Per Page immediately changes pagination on all four,
// Show Record ID Column immediately adds/removes the ID column on all four.
export function TablePreferencesSettings({ onDirtyChange }) {
  const appSettings = useAppSettings();
  const { draft, setField, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    appSettings.table,
    appSettings.setTable,
    APP_SETTINGS_DEFAULTS.table,
    { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Applies to the Rooms, Rate Plans, Competitors, and Competitive Sets tables.</p>
        <form onSubmit={handleSave} style={{ marginTop: "var(--space-5)" }}>
          <div className="form-grid">
            <Field label="Rows Per Page" id="tp-page-size">
              <Select
                id="tp-page-size"
                options={PAGE_SIZES}
                value={String(draft.pageSize)}
                onChange={(e) => setField("pageSize")(Number(e.target.value))}
              />
            </Field>
          </div>
          <div style={{ marginTop: "var(--space-6)" }}>
            <FeatureChipGrid
              label="Show Record ID Column"
              options={["Shown", "Hidden"]}
              value={draft.showIdColumn ? "Shown" : "Hidden"}
              onChange={(v) => setField("showIdColumn")(v === "Shown")}
              multiple={false}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "var(--space-6)" }}>
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
