"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CornerDownLeft,
  ExternalLink,
  FileText,
  Globe2,
  Images,
  Keyboard,
  LayoutDashboard,
  MenuSquare,
  Paintbrush,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useApp } from "./app-provider";
import { useModalBehavior } from "./use-modal-behavior";
import { rankCommands } from "@/lib/command-search";
import { cn, formatDate } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  keywords?: string;
  group: string;
  detail?: string;
  href: string;
  icon: typeof Search;
}

const destinations: Command[] = [
  { id: "go-overview", label: "Overview", group: "Go to", href: "/dashboard", icon: LayoutDashboard, keywords: "dashboard home metrics" },
  { id: "go-website", label: "Website", group: "Go to", href: "/dashboard/website", icon: Globe2, keywords: "sections copy editor" },
  { id: "go-content", label: "Content", group: "Go to", href: "/dashboard/content", icon: FileText, keywords: "services highlights process team testimonials faq" },
  { id: "go-design", label: "Design", group: "Go to", href: "/dashboard/design", icon: Paintbrush, keywords: "template palette colours fonts theme" },
  { id: "go-menu", label: "Menu", group: "Go to", href: "/dashboard/menu", icon: MenuSquare, keywords: "dishes packages categories prices" },
  { id: "go-gallery", label: "Gallery", group: "Go to", href: "/dashboard/gallery", icon: Images, keywords: "photos images collections" },
  { id: "go-leads", label: "Leads", group: "Go to", href: "/dashboard/leads", icon: Users, keywords: "inquiries requests crm kanban" },
  { id: "go-settings", label: "Settings", group: "Go to", href: "/dashboard/settings", icon: Settings, keywords: "business profile policies domain publishing plan" },
  { id: "go-preview", label: "Preview your site", group: "Go to", href: "/preview", icon: ExternalLink, keywords: "desktop mobile on-page edit" },
];

/**
 * ⌘K / Ctrl+K palette over the whole workspace: every dashboard destination
 * plus the customer's own leads, dishes, and gallery images, so finding a
 * record never means remembering which page it lives on.
 */
export function CommandPalette({ open, onClose, onShowShortcuts }: { open: boolean; onClose: () => void; onShowShortcuts: () => void }) {
  // Mounting only while open means every session starts from an empty query
  // and the first result selected, with no state to reset.
  if (!open) return null;
  return <PaletteDialog onClose={onClose} onShowShortcuts={onShowShortcuts} />;
}

function PaletteDialog({ onClose, onShowShortcuts }: { onClose: () => void; onShowShortcuts: () => void }) {
  const { state } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalBehavior({ open: true, onClose, containerRef: dialogRef });

  const commands = useMemo<Command[]>(() => [
    ...destinations,
    ...state.leads.map(lead => ({
      id: `lead-${lead.id}`,
      label: lead.customerName,
      keywords: `${lead.eventType} ${lead.email} ${lead.eventLocation} ${lead.status} lead inquiry`,
      group: "Leads",
      detail: `${lead.eventType} · ${lead.guestCount} guests · ${formatDate(lead.eventDate)}`,
      href: "/dashboard/leads",
      icon: Users,
    })),
    ...state.menuItems.map(item => ({
      id: `menu-${item.id}`,
      label: item.name,
      keywords: `${item.description} ${item.dietary.join(" ")} dish menu`,
      group: "Menu",
      detail: [item.price, item.available ? "Available" : "Unavailable"].filter(Boolean).join(" · "),
      href: "/dashboard/menu",
      icon: MenuSquare,
    })),
    ...state.gallery.map(image => ({
      id: `image-${image.id}`,
      label: image.caption || "Untitled image",
      keywords: `${image.category} ${image.eventType} ${image.location} photo gallery`,
      group: "Gallery",
      detail: [image.category, image.location].filter(Boolean).join(" · "),
      href: "/dashboard/gallery",
      icon: Images,
    })),
  ], [state.leads, state.menuItems, state.gallery]);

  // Each result carries the group heading that should precede it, so the list
  // can be grouped without mutating anything while rendering.
  const results = useMemo(() => {
    const ranked = rankCommands(query, commands, query ? 14 : 9);
    return ranked.map((command, index) => ({
      command,
      heading: command.group === ranked[index - 1]?.group ? null : command.group,
    }));
  }, [query, commands]);

  const run = (command: Command) => {
    onClose();
    router.push(command.href);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : results.length - 1;
      setActiveIndex(index => (index + step) % Math.max(results.length, 1));
    }
    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      run(results[activeIndex].command);
    }
  };

  return (
    <div className="palette-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="command-palette"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={event => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-search">
          <Search size={18} />
          <input
            autoFocus
            value={query}
            onChange={event => { setQuery(event.target.value); setActiveIndex(0); }}
            placeholder="Search pages, leads, dishes, and images…"
            aria-label="Search the workspace"
            aria-controls="palette-results"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </div>

        <div className="palette-results" id="palette-results" role="listbox" aria-label="Results">
          {results.length === 0 && (
            <p className="palette-empty">Nothing matches “{query}”. Try a customer name, a dish, or a page.</p>
          )}
          {results.map(({ command, heading }, index) => {
            const Icon = command.icon;
            return (
              <div key={command.id}>
                {heading && <p className="palette-group">{heading}</p>}
                <button
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn("palette-option", index === activeIndex && "active")}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => run(command)}
                >
                  <Icon size={16} />
                  <span>
                    <strong>{command.label}</strong>
                    {command.detail && <small>{command.detail}</small>}
                  </span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <footer className="palette-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd><CornerDownLeft size={11} /></kbd> open</span>
          <button onClick={() => { onClose(); onShowShortcuts(); }}><Keyboard size={14} /> All shortcuts</button>
        </footer>
      </div>
    </div>
  );
}
