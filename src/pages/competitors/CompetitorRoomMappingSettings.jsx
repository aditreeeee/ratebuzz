import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { MAPPING_TYPES } from "../../mocks/competitors.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { ROOM_MAPPING_SETTINGS_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";

// Default Mapping Type prefills RoomMappingForm's new-mapping baseline.
// Confidence Threshold now has a real, visible effect too: the Room Mapping
// tab flags any mapping whose `confidence` score is below this threshold as
// "Needs Review," computed live from data that already exists.
export function CompetitorRoomMappingSettings({ onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.competitors.roomMapping", ROOM_MAPPING_SETTINGS_DEFAULTS);
  const { draft, setField, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, ROOM_MAPPING_SETTINGS_DEFAULTS, { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Defaults and thresholds for the Room Mapping module.</p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <div className="form-grid__full">
            <FeatureChipGrid
              label="Default Mapping Type"
              options={MAPPING_TYPES}
              value={draft.defaultMappingType}
              onChange={setField("defaultMappingType")}
              multiple={false}
            />
          </div>
          <Field label="Confidence Threshold" id="rms-threshold" hint="Mappings below this score are flagged 'Needs Review' on the Room Mapping tab.">
            <Input
              id="rms-threshold" type="number" min="0" max="100" tabular
              value={draft.confidenceThreshold}
              onChange={(e) => setField("confidenceThreshold")(e.target.value === "" ? "" : Number(e.target.value))}
            />
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
