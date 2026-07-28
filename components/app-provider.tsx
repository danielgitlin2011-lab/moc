"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import type { AppState } from "@/lib/types";

export type ToastTone = "success" | "error" | "info";

export interface ToastOptions {
  tone?: ToastTone;
  /** A single follow-up the toast offers, typically "Undo". */
  action?: { label: string; onClick: () => void };
  /** Milliseconds before the toast retires itself. */
  duration?: number;
}

interface Toast extends ToastOptions {
  id: number;
  message: string;
  tone: ToastTone;
}

interface AppContextValue {
  state: AppState;
  ready: boolean;
  businessId: string;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  notify: (message: string, options?: ToastOptions) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const toneIcon: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export function AppProvider({
  children,
  initialState,
  businessId,
}: {
  children: React.ReactNode;
  initialState: AppState;
  businessId: string;
}) {
  const [state, setState] = useState<AppState>(initialState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const notify = useCallback((message: string, options: ToastOptions = {}) => {
    const id = nextId.current++;
    const tone = options.tone ?? "success";
    // Errors and anything offering an undo stay long enough to act on.
    const duration = options.duration ?? (options.action ? 8000 : tone === "error" ? 6000 : 3200);

    setToasts(current => [...current.slice(-2), { ...options, id, message, tone }]);
    timers.current.set(id, window.setTimeout(() => dismissToast(id), duration));
  }, [dismissToast]);

  const value = useMemo(
    () => ({ state, ready: true, businessId, setState, notify, dismissToast }),
    [state, businessId, notify, dismissToast],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      {/* Announced politely so a screen reader hears the confirmation without
          losing the caret's place in whatever the user was editing. */}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map(toast => {
          const Icon = toneIcon[toast.tone];
          return (
            <div className={`toast toast-${toast.tone}`} key={toast.id}>
              <Icon size={18} />
              <span>{toast.message}</span>
              {toast.action && (
                <button
                  className="toast-action"
                  onClick={() => {
                    toast.action?.onClick();
                    dismissToast(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button className="toast-dismiss" aria-label="Dismiss notification" onClick={() => dismissToast(toast.id)}><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
