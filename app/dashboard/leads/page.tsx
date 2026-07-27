"use client";

import { Columns3, Download, List, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { LeadKanban, LeadTable } from "@/components/lead-views";
import { LeadDetailsDrawer } from "@/components/lead-details-drawer";
import { useApp } from "@/components/app-provider";
import { Button, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function LeadsPage() {
  const { state, notify } = useApp();
  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = state.leads.find(lead => lead.id === selectedId) || null;
  const leads = useMemo(() => state.leads.filter(lead => (status === "all" || lead.status === status) && `${lead.customerName} ${lead.eventType} ${lead.email}`.toLowerCase().includes(search.toLowerCase())), [state.leads, search, status]);
  const exportCsv = () => {
    const rows = [["Customer", "Email", "Event", "Date", "Guests", "Budget", "Status"], ...state.leads.map(lead => [lead.customerName, lead.email, lead.eventType, lead.eventDate, String(lead.guestCount), lead.budget, lead.status])];
    const blob = new Blob([rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "servesite-leads.csv";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    notify("Lead export downloaded");
  };
  return (
    <DashboardShell title="Leads" description="Turn detailed event requests into booked celebrations." actions={<Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export CSV</Button>}>
      <div className="lead-summary-row"><div><span>{state.leads.length}</span><small>Total inquiries</small></div><div><span>{state.leads.filter(lead => lead.status === "New").length}</span><small>New</small></div><div><span>{state.leads.filter(lead => lead.status === "Quote sent").length}</span><small>Quotes sent</small></div><div><span>{state.leads.filter(lead => lead.status === "Won").length}</span><small>Won</small></div><p><strong>31%</strong> inquiry-to-booking rate this quarter</p></div>
      <div className="leads-toolbar"><div className="search-field"><Search size={17} /><input aria-label="Search leads" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers or events…" /></div><select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by lead status"><option value="all">All statuses</option>{["New", "Contacted", "Quote sent", "Won", "Lost"].map(value => <option key={value}>{value}</option>)}</select><div className="view-toggle labeled"><button className={cn(view === "table" && "active")} onClick={() => setView("table")}><List size={17} /> Table</button><button className={cn(view === "kanban" && "active")} onClick={() => setView("kanban")}><Columns3 size={17} /> Kanban</button></div></div>
      {leads.length === 0 ? <EmptyState icon={<Users />} title="No inquiries match" body="Try another search or clear your current status filter." /> : view === "table" ? <LeadTable leads={leads} onOpen={lead => setSelectedId(lead.id)} /> : <LeadKanban leads={leads} onOpen={lead => setSelectedId(lead.id)} />}
      <LeadDetailsDrawer lead={selected} onClose={() => setSelectedId(null)} />
    </DashboardShell>
  );
}
