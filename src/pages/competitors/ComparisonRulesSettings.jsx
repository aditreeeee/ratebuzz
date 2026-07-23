import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { useAppSettings } from "../../context/AppSettingsContext.jsx";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { APP_SETTINGS_DEFAULTS } from "../../lib/appSettingsStore.js";

// Minimum Competitors is read live by lib/competitorReadiness.js (via
// appSettingsStore) — changing it here genuinely changes the Configuration
// Readiness / Missing Items checklist app-wide. "Require Benchmark Lock" was
// removed: the architecture already makes a competitor's benchmark property
// permanently non-reassignable, so there's nothing left to "lock."
export function ComparisonRulesSettings({ onDirtyChange }) {
  const appSettings = useAppSettings();
  const { draft, set, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    appSettings.comparisonRules,
    appSettings.setComparisonRules,
    APP_SETTINGS_DEFAULTS.comparisonRules,
    { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Rules the Readiness / Missing Configuration Items checklist is measured against.</p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Minimum Competitors" id="crs-min" hint="Properties with fewer active competitors than this fail the readiness check.">
            <Input
              id="crs-min" type="number" min="1" tabular
              value={draft.minCompetitors}
              onChange={(e) => set("minCompetitors")(e.target.value === "" ? "" : Number(e.target.value))}
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
