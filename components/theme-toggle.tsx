"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEME_CHOICES, THEME_STORAGE_KEY, resolveTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const CHOICE_EVENT = "servesite:theme-choice";

/**
 * The stored choice lives on <html>, written by the head bootstrap before
 * first paint. Reading it through an external store keeps the button state in
 * step with the DOM without a post-hydration state flip.
 */
function subscribe(onChange: () => void) {
  window.addEventListener(CHOICE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHOICE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): ThemeChoice {
  const stored = document.documentElement.dataset.themeChoice;
  return THEME_CHOICES.includes(stored as ThemeChoice) ? (stored as ThemeChoice) : "system";
}

/** Light / dark / system switch for the application chrome. */
export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, () => "system" as ThemeChoice);

  const apply = useCallback((next: ThemeChoice) => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = resolveTheme(next, prefersDark);
    document.documentElement.dataset.themeChoice = next;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing modes reject writes; the in-page choice still applies.
    }
    window.dispatchEvent(new Event(CHOICE_EVENT));
  }, []);

  // Following the OS means following it as it changes, not only at load.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getSnapshot() === "system") document.documentElement.dataset.theme = query.matches ? "dark" : "light";
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="theme-toggle" role="group" aria-label="Colour theme">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={cn(choice === value && "active")}
          aria-pressed={choice === value}
          title={`${label} theme`}
          onClick={() => apply(value)}
        >
          <Icon size={15} />
          <span className="sr-only">{label} theme</span>
        </button>
      ))}
    </div>
  );
}
