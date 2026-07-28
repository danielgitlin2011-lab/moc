"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Command,
  ExternalLink,
  FileText,
  Globe2,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MenuSquare,
  Paintbrush,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "./ui";
import { businessInitials, cn } from "@/lib/utils";
import { useApp } from "./app-provider";
import { ThemeToggle } from "./theme-toggle";
import { WorkspaceShortcuts, openCommandPalette } from "./workspace-shortcuts";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/website", label: "Website", icon: Globe2 },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/design", label: "Design", icon: Paintbrush },
  { href: "/dashboard/menu", label: "Menu", icon: MenuSquare },
  { href: "/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children, title, description, actions }: { children: React.ReactNode; title: string; description?: string; actions?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const newLeads = state.leads.filter(lead => lead.status === "New").length;

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const sidebar = (
    <>
      <div className="sidebar-brand"><BrandMark /><button className="mobile-only icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <span className="nav-label">Workspace</span>
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={cn(active && "active")}><Icon size={18} /><span>{label}</span>{label === "Leads" && newLeads > 0 && <b aria-label={`${newLeads} new leads`}>{newLeads}</b>}</Link>;
        })}
      </nav>
      <div className="sidebar-site-card">
        <div><span className={cn("status-dot", !state.business.published && "offline")} /><small>{state.business.published ? "Website live" : "Not published yet"}</small></div>
        <strong>{state.business.name}</strong>
        <Link href={`/site/${state.business.slug}`}>View website <ExternalLink size={14} /></Link>
      </div>
      <div className="sidebar-account"><div>{businessInitials(state.business.name)}</div><span><strong>Account owner</strong><small>{state.subscription.plan} plan · {state.subscription.status}</small></span><button className="icon-button" style={{ marginLeft: "auto" }} onClick={handleLogout} aria-label="Log out" title="Log out"><LogOut size={16} /></button></div>
    </>
  );

  return (
    <div className="dashboard-layout">
      <aside className={cn("dashboard-sidebar", mobileOpen && "open")}>{sidebar}</aside>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <div className="dashboard-main">
        <a className="skip-link" href="#dashboard-content">Skip to main content</a>
        <header className="dashboard-header">
          <button className="mobile-only icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
          <div className="header-actions">
            <button className="palette-trigger" onClick={openCommandPalette} aria-label="Search the workspace">
              <Command size={15} />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
            <ThemeToggle />
            {actions}
            <Link className="preview-link" href="/preview"><BarChart3 size={16} /> Preview</Link>
          </div>
        </header>
        <main className="dashboard-content" id="dashboard-content">{children}</main>
      </div>
      <WorkspaceShortcuts />
    </div>
  );
}
