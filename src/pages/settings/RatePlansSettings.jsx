import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { CANCELLATION_POLICIES, RATE_PLAN_STATUSES } from "../../mocks/ratePlans.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { RATE_PLAN_DEFAULTS_SETTINGS as DEFAULTS, PRICE_ROUNDING_OPTIONS } from "../../lib/competitorSettingsDefaults.js";

export function RatePlansSettings({ showTitle = true, onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.defaults.ratePlans", DEFAULTS);
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
        {showTitle && <h3 className="settings-section__title">Rate Plans</h3>}
        <p className="settings-section__desc">
          Cancellation Policy/Status prefill RatePlanForm when creating a new rate plan. Price Rounding is applied to Pricing
          Range prices on blur wherever they're entered.
        </p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Default Cancellation Policy" id="rps-policy">
            <Select id="rps-policy" options={CANCELLATION_POLICIES} value={draft.cancellationPolicy} onChange={set("cancellationPolicy")} />
          </Field>
          <Field label="Default Status" id="rps-status">
            <Select id="rps-status" options={RATE_PLAN_STATUSES} value={draft.status} onChange={set("status")} />
          </Field>
          <Field label="Price Rounding" id="rps-round">
            <Select id="rps-round" options={PRICE_ROUNDING_OPTIONS} value={draft.priceRounding} onChange={set("priceRounding")} />
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
