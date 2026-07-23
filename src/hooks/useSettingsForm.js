import { useState, useEffect } from "react";
import { useUnsavedChanges } from "./useUnsavedChanges.js";
import { useToast } from "../context/ToastContext.jsx";

/**
 * Shared Save/Reset/Restore-Defaults/dirty-detection contract for a Settings
 * tab, built around a `[saved, setSaved]` pair the caller supplies — either
 * `usePersistedState(key, defaults)` (for settings nobody else needs to
 * react to live) or an `AppSettingsContext`/`AppearanceContext` value+setter
 * (for settings other, unrelated components must see change instantly).
 * Either way, `draft` is the in-progress edit and is only ever committed to
 * `saved` (and therefore persisted) by calling `save()` — which is what
 * makes Reset/unsaved-changes detection/"Save disabled until dirty" all work
 * for free, instead of every settings tab hand-rolling its own local
 * useState + toast-only save.
 */
export function useSettingsForm(saved, setSaved, defaults, { onDirtyChange } = {}) {
  const toast = useToast();
  const [draft, setDraft] = useState(saved);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    onDirtyChange?.(isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(isDirty);

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e && e.target ? e.target.value : e }));
  const setField = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }));

  const save = () => {
    setSaved(draft);
    toast.success("Settings saved.");
  };
  const reset = () => setDraft(saved);
  const restoreDefaults = () => setDraft(defaults);

  return { draft, setDraft, set, setField, isDirty, save, reset, restoreDefaults, confirmOpen, requestAction, confirmDiscard, cancelDiscard };
}
