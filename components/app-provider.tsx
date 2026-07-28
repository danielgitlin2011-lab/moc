"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { AppState } from "@/lib/types";

interface AppContextValue {
  state: AppState;
  ready: boolean;
  businessId: string;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  notify: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

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
  const [toast, setToast] = useState("");

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  const value = useMemo(() => ({ state, ready: true, businessId, setState, notify }), [state, businessId, notify]);

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          <span>{toast}</span>
          <button aria-label="Dismiss notification" onClick={() => setToast("")}><X size={16} /></button>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
