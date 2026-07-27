"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  Globe2,
  Images,
  LayoutDashboard,
  Menu,
  MenuSquare,
  Paintbrush,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "./ui";
import { cn } from "@/lib/utils";
import { useApp } from "./app-provider";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/website", label: "Website", icon: Globe2 },
  { href: "/dashboard/design", label: "Design", icon: Paintbrush },
  { href: "/dashboard/menu", label: "Menu", icon: MenuSquare },
  { href: "/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children, title, description, actions }: { children: React.ReactNode; title: string; description?: string; actions?: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const newLeads = state.leads.filter(lead => lead.status === "New").length;

  const sidebar = (
    <>
      <div className="sidebar-brand"><BrandMark /><button className="mobile-only icon-button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <span className="nav-label">Workspace</span>
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cn(active && "active")}><Icon size={18} /><span>{label}</span>{label === "Leads" && newLeads > 0 && <b>{newLeads}</b>}</Link>;
        })}
      </nav>
      <div className="sidebar-site-card">
        <div><span className="status-dot" /><small>Website live</small></div>
        <strong>{state.business.name}</strong>
        <Link href={`/site/${state.business.slug}`}>View website <ExternalLink size={14} /></Link>
      </div>
      <div className="sidebar-account"><div>OE</div><span><strong>Olivia Ember</strong><small>Business plan</small></span></div>
    </>
  );

  return (
    <div className="dashboard-layout">
      <aside className={cn("dashboard-sidebar", mobileOpen && "open")}>{sidebar}</aside>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <button className="mobile-only icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div><h1>{title}</h1>{description && <p>{description}</p>}</div>
          <div className="header-actions">{actions}<Link className="preview-link" href="/preview"><BarChart3 size={16} /> Preview</Link></div>
        </header>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
