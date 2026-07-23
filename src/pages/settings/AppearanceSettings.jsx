import React from "react";
import { Check, RotateCcw } from "lucide-react";
import { Card } from "../../components/ui/Card.jsx";
import { Field, Select } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { FeatureChipGrid } from "../../components/ui/FeatureChipGrid.jsx";
import { useAppearance, ACCENTS, DENSITIES } from "../../context/AppearanceContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function AppearanceSettings() {
  const { density, accent, reduceMotion, setDensity, setAccent, setReduceMotion, resetAppearance } = useAppearance();
  const toast = useToast();

  return (
    <Card>
      <p className="settings-section__desc">Personalize density and accent color. Applies instantly across the app and is remembered on this device.</p>
      <div className="form-grid" style={{ marginTop: "var(--space-5)" }}>
        <Field label="Table Density" id="as-density" hint="Compact tightens row spacing across all tables.">
          <Select
            id="as-density"
            options={DENSITIES}
            value={density}
            onChange={(e) => { setDensity(e.target.value); toast.success(`Density set to ${e.target.value}.`); }}
          />
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
                  onClick={() => { setAccent(a.value); toast.success(`Accent set to ${a.name}.`); }}
                  aria-label={a.name}
                  aria-pressed={accent === a.value}
                  title={a.name}
                >
                  {accent === a.value && <Check size={16} strokeWidth={3} color="white" />}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </div>
      <div style={{ marginTop: "var(--space-6)" }}>
        <FeatureChipGrid
          label="Reduce Motion"
          options={["Off", "On"]}
          value={reduceMotion ? "On" : "Off"}
          onChange={(v) => { setReduceMotion(v === "On"); toast.success(`Reduce Motion ${v === "On" ? "enabled" : "disabled"}.`); }}
          multiple={false}
          hint="Shortens or disables animations and transitions across the app."
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-6)" }}>
        <Button
          variant="ghost"
          size="md"
          icon={RotateCcw}
          type="button"
          onClick={() => { resetAppearance(); toast.info("Appearance reset to defaults."); }}
        >
          Reset to Defaults
        </Button>
      </div>
    </Card>
  );
}
