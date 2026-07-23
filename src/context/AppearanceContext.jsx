import React, { createContext, useContext, useState, useMemo, useEffect } from "react";

const STORAGE_KEY = "ratebuzz.appearance";

export const DENSITIES = ["Comfortable", "Compact"];
export const ACCENTS = [
  { name: "Twilight", value: "#03045e" },
  { name: "Teal", value: "#0077b6" },
  { name: "Surf", value: "#00b4d8" },
];

const DEFAULTS = { density: "Comfortable", accent: ACCENTS[1].value, reduceMotion: false };

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      density: DENSITIES.includes(parsed.density) ? parsed.density : DEFAULTS.density,
      accent: ACCENTS.some((a) => a.value === parsed.accent) ? parsed.accent : DEFAULTS.accent,
      reduceMotion: typeof parsed.reduceMotion === "boolean" ? parsed.reduceMotion : DEFAULTS.reduceMotion,
    };
  } catch {
    return DEFAULTS;
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c) => Math.round(amount > 0 ? c + (255 - c) * amount : c * (1 + amount));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

// Every component in the app reads --color-teal / --color-surf / --color-twilight
// directly (no indirection token), so re-pointing those three CSS variables at the
// chosen accent is enough to re-skin every button, badge, focus ring, etc. live.
function applyAppearance({ density, accent, reduceMotion }) {
  const root = document.documentElement;
  root.dataset.density = density === "Compact" ? "compact" : "comfortable";
  root.style.setProperty("--color-teal", accent);
  root.style.setProperty("--color-surf", shade(accent, 0.35));
  root.style.setProperty("--color-twilight", shade(accent, -0.35));
  if (reduceMotion) root.dataset.motion = "reduced";
  else delete root.dataset.motion;
}

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const [state, setState] = useState(loadStored);

  useEffect(() => {
    applyAppearance(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(
    () => ({
      density: state.density,
      accent: state.accent,
      reduceMotion: state.reduceMotion,
      setDensity: (density) => setState((s) => ({ ...s, density })),
      setAccent: (accent) => setState((s) => ({ ...s, accent })),
      setReduceMotion: (reduceMotion) => setState((s) => ({ ...s, reduceMotion })),
      resetAppearance: () => setState(DEFAULTS),
    }),
    [state]
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider");
  return ctx;
}
