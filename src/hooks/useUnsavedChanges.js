import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Reusable dirty-state guard for forms and multi-step wizards.
 *
 * - Warns on browser refresh/close (`beforeunload`) while `isDirty` is true.
 * - Exposes `requestAction(action)` to wrap any close/navigate handler: if the
 *   form is dirty, a confirm step is surfaced (via `confirmOpen` +
 *   `confirmDiscard`/`cancelDiscard`) instead of running `action` immediately.
 *
 * Usage:
 *   const isDirty = open && JSON.stringify(form) !== JSON.stringify(baseline);
 *   const { confirmOpen, requestAction, confirmDiscard, cancelDiscard } = useUnsavedChanges(isDirty);
 *   <Modal onClose={() => requestAction(onClose)} ... />
 *   <ConfirmModal open={confirmOpen} onClose={cancelDiscard} onConfirm={confirmDiscard} ... />
 */
export function useUnsavedChanges(isDirty) {
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const requestAction = useCallback((action) => {
    if (!dirtyRef.current) {
      action();
      return;
    }
    setPendingAction(() => action);
  }, []);

  const confirmDiscard = useCallback(() => {
    setPendingAction((action) => {
      if (action) action();
      return null;
    });
  }, []);

  const cancelDiscard = useCallback(() => setPendingAction(null), []);

  return { confirmOpen: !!pendingAction, requestAction, confirmDiscard, cancelDiscard };
}
