export type ThemeChoice = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "servesite-theme";
export const THEME_CHOICES: ThemeChoice[] = ["light", "dark", "system"];

/**
 * Runs before first paint, inlined in the document head.
 *
 * "system" is resolved here rather than in CSS so a single
 * `[data-theme]` contract covers both the saved choice and the OS
 * preference — see the dark-mode block in app/globals.css.
 */
export const themeBootstrap = `(function(){try{
var stored=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
var choice=stored==="light"||stored==="dark"?stored:"system";
var resolved=choice==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):choice;
document.documentElement.dataset.theme=resolved;
document.documentElement.dataset.themeChoice=choice;
}catch(e){}})();`;

/** The theme actually painted, given a stored choice and the OS preference. */
export function resolveTheme(choice: ThemeChoice, prefersDark: boolean) {
  if (choice === "system") return prefersDark ? "dark" : "light";
  return choice;
}
