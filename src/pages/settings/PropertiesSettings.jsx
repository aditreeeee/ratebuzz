import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { TagPicker } from "../../components/ui/TagChips.jsx";
import { STATUSES, PROPERTY_TAGS } from "../../mocks/properties.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";

const DEFAULTS = { status: "Draft", requireApproval: "No", tags: [] };

export function PropertiesSettings({ showTitle = true, onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.defaults.properties", DEFAULTS);
  const { draft, set, setField, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, DEFAULTS, { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        {showTitle && <h3 className="settings-section__title">Properties</h3>}
        <p className="settings-section__desc">
          Applied by PropertyForm when creating a new property. "Require Approval" forces new properties to start as Draft
          regardless of the default status below, since there's no separate approval workflow to gate activation otherwise.
        </p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Default Status for New Properties" id="ps-status">
            <Select id="ps-status" options={STATUSES} value={draft.status} onChange={set("status")} />
          </Field>
          <Field label="Require Approval Before Activation" id="ps-approval">
            <Select id="ps-approval" options={["Yes", "No"]} value={draft.requireApproval} onChange={set("requireApproval")} />
          </Field>
          <div className="form-grid__full">
            <Field label="Default Tags" id="ps-tags">
              <TagPicker options={PROPERTY_TAGS} value={draft.tags} onChange={setField("tags")} />
            </Field>
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
