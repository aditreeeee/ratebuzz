import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useAppSettings } from "./AppSettingsContext.jsx";
import { NOTIFICATION_DURATIONS } from "../lib/appSettingsStore.js";

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { notifications } = useAppSettings();

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Notifications Settings' master switch/duration are read at push-time
  // (not baked into a stale closure) since `push` is recreated whenever
  // `notifications` changes — turning notifications off genuinely suppresses
  // every toast.* call app-wide, not just newly-written ones.
  const push = useCallback(
    (message, variant = "info") => {
      if (!notifications.enabled) return;
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const duration = NOTIFICATION_DURATIONS[notifications.duration] ?? NOTIFICATION_DURATIONS.Normal;
      setTimeout(() => remove(id), duration);
    },
    [remove, notifications]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  const icons = { success: CheckCircle2, error: XCircle, info: Info };
  const positionClass = notifications.position === "top-right" ? "toast-viewport--top-right" : "";

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast-viewport ${positionClass}`} role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => {
          const Icon = icons[t.variant];
          return (
            <div key={t.id} className={`toast toast--${t.variant}`}>
              <Icon size={18} strokeWidth={2} />
              <span>{t.message}</span>
              <button className="toast__close" onClick={() => remove(t.id)} aria-label="Dismiss">
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
