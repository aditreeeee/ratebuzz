import React from "react";
import { PlugZap, Save, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ConfirmModal } from "../../components/ui/Modal.jsx";
import { FIELD_LABELS, ENVIRONMENTS } from "../../mocks/integrations.js";
import { usePersistedState } from "../../hooks/usePersistedState.js";
import { useSettingsForm } from "../../hooks/useSettingsForm.js";

const EMPTY_VALUES = {
  apiBaseUrl: "", apiKey: "", clientId: "", clientSecret: "",
  accessToken: "", username: "", password: "", environment: ENVIRONMENTS[0],
  configured: false,
};

const INPUT_TYPES = {
  apiKey: "password",
  clientSecret: "password",
  accessToken: "password",
  password: "password",
};

// Entered values now persist across refresh (previously reset to blank on
// every mount) — "Configured (local)" reflects that persisted state, not
// just the current session. Test Connection stays disabled: it honestly
// requires a live backend this preview doesn't have, so it's not a silent
// placeholder — it's a clearly-labeled unavailable action.
export function IntegrationCard({ definition }) {
  const [saved, setSaved] = usePersistedState(`settings.integrations.${definition.key}`, EMPTY_VALUES);
  const { draft, set, isDirty, save, reset, confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useSettingsForm(
    saved, setSaved, EMPTY_VALUES
  );

  const handleSave = (e) => {
    e.preventDefault();
    setSaved({ ...draft, configured: true });
  };

  return (
    <>
    <Card>
      <div className="integration-card__header">
        <div className="integration-card__icon"><PlugZap size={18} strokeWidth={2} /></div>
        <div className="integration-card__heading">
          <h3 className="integration-card__title">{definition.name}</h3>
          <p className="integration-card__desc">{definition.description}</p>
        </div>
        <Badge variant={saved.configured ? "success" : "warning"}>{saved.configured ? "Configured (local)" : "Not Configured"}</Badge>
      </div>

      <form onSubmit={handleSave} className="integration-card__form">
        <div className="form-grid">
          {definition.fields.includes("environment") && (
            <Field label={FIELD_LABELS.environment} id={`${definition.key}-environment`}>
              <Select
                id={`${definition.key}-environment`}
                options={ENVIRONMENTS}
                value={draft.environment}
                onChange={set("environment")}
              />
            </Field>
          )}
          {definition.fields.filter((f) => f !== "environment").map((f) => (
            <Field key={f} label={FIELD_LABELS[f]} id={`${definition.key}-${f}`}>
              <Input
                id={`${definition.key}-${f}`}
                type={INPUT_TYPES[f] || "text"}
                value={draft[f]}
                onChange={set(f)}
                placeholder={`Enter ${FIELD_LABELS[f]}`}
                autoComplete="off"
              />
            </Field>
          ))}
        </div>

        <div className="integration-card__footer">
          <Button variant="ghost" size="sm" icon={PlugZap} disabled type="button" title="Requires a live backend — not available in this preview">Test Connection</Button>
          {isDirty && (
            <button className="btn btn--ghost btn--sm" type="button" onClick={reset}>
              <RotateCcw size={14} strokeWidth={2} /> Reset
            </button>
          )}
          <Button variant="primary" size="sm" icon={Save} type="submit" disabled={!isDirty}>Save Configuration</Button>
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
