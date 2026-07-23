import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { PRIORITY_LEVELS } from "../../mocks/competitors.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { COMPETITOR_GENERAL_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";

// Default Currency was removed from here — competitors have no currency
// field of their own (it was a false claim in the old hint text), and
// currency now lives solely on Rate Plan Mapping's own settings tab, so
// only one setting ever claims to control that field.
export function CompetitorGeneralSettings({ onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.competitors.general", COMPETITOR_GENERAL_DEFAULTS);
  const { draft, set, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, COMPETITOR_GENERAL_DEFAULTS, { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Applied when creating a new Competitor Property.</p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Default Priority" id="cgs-priority" hint="Prefills Add Competitor's Priority field.">
            <Select id="cgs-priority" options={PRIORITY_LEVELS} value={draft.defaultPriority} onChange={set("defaultPriority")} />
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
