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

const DURATIONS = ["Short", "Normal", "Long"];
const POSITIONS = ["bottom-right", "top-right"];

// All three fields are read live by ToastContext.jsx on every toast.* call —
// turning notifications off genuinely suppresses every toast in the app,
// Duration changes the real auto-dismiss timer, Position moves the toast
// stack on screen. Try it: toggle off below, then perform any save/archive
// elsewhere and note nothing appears.
export function NotificationsSettings({ onDirtyChange }) {
  const appSettings = useAppSettings();
  const { draft, setField, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    appSettings.notifications,
    appSettings.setNotifications,
    APP_SETTINGS_DEFAULTS.notifications,
    { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Frontend toast notifications shown after actions (save, archive, delete, import, etc).</p>
        <form onSubmit={handleSave} style={{ marginTop: "var(--space-5)" }}>
          <FeatureChipGrid
            label="Enable Toast Notifications"
            options={["Enabled", "Disabled"]}
            value={draft.enabled ? "Enabled" : "Disabled"}
            onChange={(v) => setField("enabled")(v === "Enabled")}
            multiple={false}
          />
          <div className="form-grid" style={{ marginTop: "var(--space-6)" }}>
            <Field label="Duration" id="ns-duration" hint="How long a notification stays visible before auto-dismissing.">
              <Select id="ns-duration" options={DURATIONS} value={draft.duration} onChange={(e) => setField("duration")(e.target.value)} disabled={!draft.enabled} />
            </Field>
            <Field label="Position" id="ns-position">
              <Select
                id="ns-position"
                options={POSITIONS}
                value={draft.position}
                onChange={(e) => setField("position")(e.target.value)}
                disabled={!draft.enabled}
              />
            </Field>
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
