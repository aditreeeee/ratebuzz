import React, { useState } from "react";
import { PlugZap, Save } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Input, Select } from "../../components/ui/Input.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { FIELD_LABELS, ENVIRONMENTS } from "../../mocks/integrations.js";
import { useToast } from "../../context/ToastContext.jsx";

const EMPTY_VALUES = {
  apiBaseUrl: "", apiKey: "", clientId: "", clientSecret: "",
  accessToken: "", username: "", password: "", environment: ENVIRONMENTS[0],
};

const INPUT_TYPES = {
  apiKey: "password",
  clientSecret: "password",
  accessToken: "password",
  password: "password",
};

export function IntegrationCard({ definition }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [saved, setSaved] = useState(false);
  const toast = useToast();

  const set = (key) => (e) => {
    setSaved(false);
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    toast.success(`${definition.name} configuration saved.`);
  };

  return (
    <Card>
      <div className="integration-card__header">
        <div className="integration-card__icon"><PlugZap size={18} strokeWidth={2} /></div>
        <div className="integration-card__heading">
          <h3 className="integration-card__title">{definition.name}</h3>
          <p className="integration-card__desc">{definition.description}</p>
        </div>
        <Badge variant={saved ? "success" : "warning"}>{saved ? "Configured (local)" : "Not Configured"}</Badge>
      </div>

      <form onSubmit={handleSave} className="integration-card__form">
        <div className="form-grid">
          {definition.fields.includes("environment") && (
            <Field label={FIELD_LABELS.environment} id={`${definition.key}-environment`}>
              <Select
                id={`${definition.key}-environment`}
                options={ENVIRONMENTS}
                value={values.environment}
                onChange={set("environment")}
              />
            </Field>
          )}
          {definition.fields.filter((f) => f !== "environment").map((f) => (
            <Field key={f} label={FIELD_LABELS[f]} id={`${definition.key}-${f}`}>
              <Input
                id={`${definition.key}-${f}`}
                type={INPUT_TYPES[f] || "text"}
                value={values[f]}
                onChange={set(f)}
                placeholder={`Enter ${FIELD_LABELS[f]}`}
                autoComplete="off"
              />
            </Field>
          ))}
        </div>

        <div className="integration-card__footer">
          <Button variant="ghost" size="sm" icon={PlugZap} disabled type="button" title="Requires a live backend — not available in this preview">Test Connection</Button>
          <Button variant="primary" size="sm" icon={Save} type="submit">Save Configuration</Button>
        </div>
      </form>
    </Card>
  );
}
