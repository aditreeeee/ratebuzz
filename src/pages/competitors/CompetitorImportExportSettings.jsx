import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { IMPORT_EXPORT_SETTINGS_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";

const EXPORT_FORMATS = ["CSV", "Excel"];

// Default Export Format: clicking ExportMenu's main button (not just opening
// its dropdown) now exports immediately in this format. Include Archived
// changes what rows list pages' export actually includes. Skip Invalid Rows
// changes whether ImportWizard's confirm step blocks entirely on any invalid
// row or proceeds with the valid ones.
export function CompetitorImportExportSettings({ onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.competitors.importExport", IMPORT_EXPORT_SETTINGS_DEFAULTS);
  const { draft, set, setField, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, IMPORT_EXPORT_SETTINGS_DEFAULTS, { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Defaults applied when importing or exporting data across the app.</p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Default Export Format" id="ies-format">
            <Select id="ies-format" options={EXPORT_FORMATS} value={draft.defaultFormat} onChange={set("defaultFormat")} />
          </Field>
          <div className="form-grid__full">
            <FeatureChipGrid
              label="Include Archived Records in Export"
              options={["No", "Yes"]}
              value={draft.includeArchived ? "Yes" : "No"}
              onChange={(v) => setField("includeArchived")(v === "Yes")}
              multiple={false}
            />
          </div>
          <div className="form-grid__full">
            <FeatureChipGrid
              label="Skip Invalid Rows on Import"
              options={["No", "Yes"]}
              value={draft.skipInvalidRows ? "Yes" : "No"}
              onChange={(v) => setField("skipInvalidRows")(v === "Yes")}
              multiple={false}
              hint="When off, an import with any invalid row is blocked entirely instead of importing the valid rows only."
            />
          </div>
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
