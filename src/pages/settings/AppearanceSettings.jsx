import React, { useState } from "react";
import { Save, Check } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const ACCENTS = [
  { name: "Twilight", value: "#03045e" },
  { name: "Teal", value: "#0077b6" },
  { name: "Surf", value: "#00b4d8" },
];

export function AppearanceSettings() {
  const toast = useToast();
  const [density, setDensity] = useState("Comfortable");
  const [accent, setAccent] = useState(ACCENTS[1].value);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Appearance preferences saved.");
  };

  return (
    <Card>
      <h3 className="settings-section__title">Appearance</h3>
      <p className="settings-section__desc">Personalize density and accent color. Applies to your account only.</p>
      <form onSubmit={handleSave} style={{ marginTop: "var(--space-5)" }}>
        <div className="form-grid">
          <Field label="Table Density" id="as-density">
            <Select id="as-density" options={["Comfortable", "Compact"]} value={density} onChange={(e) => setDensity(e.target.value)} />
          </Field>
          <div className="form-grid__full">
            <Field label="Accent Color" id="as-accent">
              <div className="accent-picker">
                {ACCENTS.map((a) => (
                  <button
                    type="button"
                    key={a.value}
                    className="accent-swatch"
                    style={{ background: a.value }}
                    onClick={() => setAccent(a.value)}
                    aria-label={a.name}
                  >
                    {accent === a.value && <Check size={16} strokeWidth={3} color="white" />}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="md" icon={Save} type="submit">Save Changes</Button>
        </div>
      </form>
    </Card>
  );
}
