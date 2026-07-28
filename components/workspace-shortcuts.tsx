"use client";

import { useRouter } from "next/navigation";
import { Keyboard, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommandPalette } from "./command-palette";
import { useModalBehavior } from "./use-modal-behavior";

/** `g` then a letter jumps straight to a section, the way a mail client does. */
const jumpTargets: Record<string, { href: string; label: string }> = {
  o: { href: "/dashboard", label: "Overview" },
  w: { href: "/dashboard/website", label: "Website" },
  c: { href: "/dashboard/content", label: "Content" },
  d: { href: "/dashboard/design", label: "Design" },
  m: { href: "/dashboard/menu", label: "Menu" },
  i: { href: "/dashboard/gallery", label: "Gallery (images)" },
  l: { href: "/dashboard/leads", label: "Leads" },
  s: { href: "/dashboard/settings", label: "Settings" },
  p: { href: "/preview", label: "Preview your site" },
};

const groups = [
  {
    title: "Anywhere",
    items: [
      { keys: ["⌘", "K"], label: "Open the command palette" },
      { keys: ["?"], label: "Show this list" },
      { keys: ["Esc"], label: "Close the open panel or dialog" },
    ],
  },
  {
    title: "Jump to",
    items: Object.entries(jumpTargets).map(([key, target]) => ({ keys: ["G", key.toUpperCase()], label: target.label })),
  },
  {
    title: "Leads board",
    items: [
      { keys: ["⌘", "←"], label: "Move the focused inquiry back a stage" },
      { keys: ["⌘", "→"], label: "Move the focused inquiry forward a stage" },
    ],
  },
];

export const OPEN_PALETTE_EVENT = "servesite:open-command-palette";

/** Opens the palette from anywhere in the tree without lifting its state. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

/** True while the keystroke belongs to whatever the user is typing into. */
function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  if (element.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
}

export function WorkspaceShortcuts() {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  // Set while `g` is armed, and cleared if the second key never arrives.
  const jumpTimer = useRef<number | null>(null);
  const awaitingJump = useRef(false);

  const closeHelp = useCallback(() => setHelpOpen(false), []);
  useModalBehavior({ open: helpOpen, onClose: closeHelp, containerRef: helpRef });

  useEffect(() => {
    const disarm = () => {
      awaitingJump.current = false;
      if (jumpTimer.current) window.clearTimeout(jumpTimer.current);
      jumpTimer.current = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setHelpOpen(false);
        setPaletteOpen(open => !open);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;

      if (awaitingJump.current) {
        const target = jumpTargets[event.key.toLowerCase()];
        disarm();
        if (target) {
          event.preventDefault();
          router.push(target.href);
        }
        return;
      }
      if (event.key.toLowerCase() === "g") {
        awaitingJump.current = true;
        jumpTimer.current = window.setTimeout(disarm, 1600);
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setPaletteOpen(false);
        setHelpOpen(open => !open);
      }
    };

    // The header's search button is a plain control elsewhere in the tree, so
    // it asks for the palette through an event rather than lifted state.
    const onRequest = () => {
      setHelpOpen(false);
      setPaletteOpen(true);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, onRequest);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, onRequest);
      disarm();
    };
  }, [router]);

  return (
    <>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onShowShortcuts={() => setHelpOpen(true)} />
      {helpOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeHelp}>
          <div className="shortcut-dialog" ref={helpRef} role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onMouseDown={event => event.stopPropagation()}>
            <header>
              <span><Keyboard size={16} /> Keyboard</span>
              <h2 id="shortcut-title">Shortcuts</h2>
              <button onClick={closeHelp} aria-label="Close shortcuts"><X size={18} /></button>
            </header>
            {groups.map(group => (
              <section key={group.title}>
                <h3>{group.title}</h3>
                <dl>
                  {group.items.map(item => (
                    <div key={item.label}>
                      <dt>{item.keys.map((key, index) => <kbd key={index}>{key}</kbd>)}</dt>
                      <dd>{item.label}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
