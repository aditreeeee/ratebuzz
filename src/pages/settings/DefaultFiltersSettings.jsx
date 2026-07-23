import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { COMPETITOR_STATUSES } from "../../mocks/competitors.js";
import { DEFAULT_FILTERS_DEFAULTS } from "../../lib/appSettingsStore.js";

const VIEWS = ["active", "archived"];
const VIEW_LABELS = { active: "Active", archived: "Archived" };
const COMPETITOR_STATUS_OPTIONS = ["All", ...COMPETITOR_STATUSES];

// Unlike General/Notifications/Table Preferences, these aren't live-reactive
// across the app — they're read once, as the *starting* value each list
// page's own already-persisted filter state initializes from (the same way
// "Reset Filters" on those pages already reverts to a starting point).
// Changing a default here doesn't retroactively change a filter you've
// already set on a list page — it changes what a fresh visit (or a Reset)
// starts from, exactly like every other settings tab's "defaults" concept.
export function DefaultFiltersSettings({ onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.defaultFilters", DEFAULT_FILTERS_DEFAULTS);
  const { draft, setField, isDirty, save, reset, restoreDefaults, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved,
    setSaved,
    DEFAULT_FILTERS_DEFAULTS,
    { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">
          What the Rooms, Rate Plans, and Competitors list pages start from on a fresh visit or "Reset Filters" — not a live override of filters you've already chosen.
        </p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Rooms — Default View" id="df-rooms-view">
            <Select
              id="df-rooms-view"
              options={VIEWS.map((v) => VIEW_LABELS[v])}
              value={VIEW_LABELS[draft.roomsView]}
              onChange={(e) => setField("roomsView")(VIEWS.find((v) => VIEW_LABELS[v] === e.target.value))}
            />
          </Field>
          <Field label="Rate Plans — Default View" id="df-rateplans-view">
            <Select
              id="df-rateplans-view"
              options={VIEWS.map((v) => VIEW_LABELS[v])}
              value={VIEW_LABELS[draft.ratePlansView]}
              onChange={(e) => setField("ratePlansView")(VIEWS.find((v) => VIEW_LABELS[v] === e.target.value))}
            />
          </Field>
          <Field label="Competitors — Default Status" id="df-competitors-status">
            <Select
              id="df-competitors-status"
              options={COMPETITOR_STATUS_OPTIONS}
              value={draft.competitorsStatus}
              onChange={(e) => setField("competitorsStatus")(e.target.value)}
            />
          </Field>
          <div className="form-grid__full" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {isDirty && (
              <button className="btn btn--ghost btn--md" type="button" onClick={reset}>
                <RotateCcw size={15} strokeWidth={2} /> Reset Changes
              </button>
            )}
            <button className="btn btn--ghost btn--md" type="button" onClick={restoreDefaults}>Restore Defaults</button>
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
