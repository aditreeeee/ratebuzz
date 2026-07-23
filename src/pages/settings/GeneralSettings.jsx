import React, { useEffect } from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { CURRENCIES, TIME_ZONES } from "../../mocks/properties.js";
import { useAppSettings } from "../../context/AppSettingsContext.jsx";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { APP_SETTINGS_DEFAULTS } from "../../lib/appSettingsStore.js";

const DATE_FORMATS = ["DD MMM YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

// Every field here has a real, live effect: Organization Name renders in the
// Sidebar's brand mark, and Date Format / Default Currency / Time Zone are
// read by formatDate()/formatCurrency() (src/lib/format.js) — used
// everywhere a date or currency renders across the app — the instant Save
// is clicked, not just after a refresh.
export function GeneralSettings({ onDirtyChange }) {
  const appSettings = useAppSettings();
  const { draft, set, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    appSettings.general,
    appSettings.setGeneral,
    APP_SETTINGS_DEFAULTS.general,
    { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Organization-wide defaults applied across the platform.</p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Organization Name" id="gs-org">
            <Input id="gs-org" value={draft.orgName} onChange={set("orgName")} />
          </Field>
          <Field label="Default Date Format" id="gs-date">
            <Select id="gs-date" options={DATE_FORMATS} value={draft.dateFormat} onChange={set("dateFormat")} />
          </Field>
          <Field label="Default Currency" id="gs-currency">
            <Select id="gs-currency" options={CURRENCIES} value={draft.currency} onChange={set("currency")} />
          </Field>
          <Field label="Default Time Zone" id="gs-tz">
            <Select id="gs-tz" options={TIME_ZONES} value={draft.timeZone} onChange={set("timeZone")} />
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
