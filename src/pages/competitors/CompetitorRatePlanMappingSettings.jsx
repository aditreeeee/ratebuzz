import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { MEAL_PLANS, mealPlanLabel } from "../../mocks/ratePlans.js";
import { CURRENCIES } from "../../mocks/properties.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";
import { RATE_PLAN_MAPPING_SETTINGS_DEFAULTS } from "../../lib/competitorSettingsDefaults.js";

// Both fields prefill RatePlanMappingForm's new-mapping baseline — this is
// the one place "Default Currency" for competitor mappings lives (not
// duplicated on the General tab, since Rate Plan Mapping is the only place
// a competitor record actually carries a currency).
export function CompetitorRatePlanMappingSettings({ onDirtyChange }) {
  const [saved, setSaved] = usePersistedState("settings.competitors.ratePlanMapping", RATE_PLAN_MAPPING_SETTINGS_DEFAULTS);
  const { draft, set, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, RATE_PLAN_MAPPING_SETTINGS_DEFAULTS, { onDirtyChange }
  );

  const handleSave = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <>
      <Card>
        <p className="settings-section__desc">Defaults for the Rate Plan Mapping module.</p>
        <form onSubmit={handleSave} className="form-grid" style={{ marginTop: "var(--space-5)" }}>
          <Field label="Default Meal Plan" id="rpms-meal" hint={mealPlanLabel(draft.defaultMealPlan)}>
            <Select id="rpms-meal" options={MEAL_PLANS} value={draft.defaultMealPlan} onChange={set("defaultMealPlan")} />
          </Field>
          <Field label="Default Currency" id="rpms-currency">
            <Select id="rpms-currency" options={CURRENCIES} value={draft.defaultCurrency} onChange={set("defaultCurrency")} />
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
