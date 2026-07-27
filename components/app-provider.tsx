"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { initialData } from "@/lib/demo-data";
import type { AppState } from "@/lib/types";

const STORAGE_KEY = "servesite-demo-v3";

interface AppContextValue {
  state: AppState;
  ready: boolean;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  reset: () => void;
  notify: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialData);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<AppState>;
          const savedSections = parsed.sections || [];
          // A collection saved as an empty array is a deliberate choice; a missing one means the
          // stored snapshot predates that collection, so fall back to the seeded content.
          const collection = <K extends "services" | "testimonials" | "faqs" | "stats" | "processSteps" | "team">(key: K) =>
            Array.isArray(parsed[key]) ? (parsed[key] as AppState[K]) : initialData[key];
          setState({
            ...initialData,
            ...parsed,
            services: collection("services"),
            testimonials: collection("testimonials"),
            faqs: collection("faqs"),
            stats: collection("stats"),
            processSteps: collection("processSteps"),
            team: collection("team"),
            business: {
              ...initialData.business,
              ...parsed.business,
              social: { ...initialData.business.social, ...parsed.business?.social },
              openingHours: parsed.business?.openingHours?.length ? parsed.business.openingHours : initialData.business.openingHours,
            },
            theme: { ...initialData.theme, ...parsed.theme },
            notifications: { ...initialData.notifications, ...parsed.notifications },
            sections: initialData.sections.map(defaultSection => ({
              ...defaultSection,
              ...savedSections.find(section => section.id === defaultSection.id),
            })),
          });
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  const reset = useCallback(() => {
    setState(structuredClone(initialData));
    window.localStorage.removeItem(STORAGE_KEY);
    notify("Demo data restored");
  }, [notify]);

  const value = useMemo(() => ({ state, ready, setState, reset, notify }), [state, ready, reset, notify]);

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
