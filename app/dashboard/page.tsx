"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Eye, Globe2, MenuSquare, MessageSquareText, Paintbrush, TrendingUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, LinkButton, LoadingState } from "@/components/ui";
import { useApp } from "@/components/app-provider";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { state, ready } = useApp();
  if (!ready) return <DashboardShell title="Overview"><LoadingState /></DashboardShell>;
  const newLeads = state.leads.filter(lead => lead.status === "New");
  const mostViewed = [...state.menuItems].sort((a, b) => b.views - a.views)[0];
  return (
    <DashboardShell title="Good morning, Olivia" description="Here’s what’s happening with Olive & Ember today." actions={<LinkButton href="/dashboard/website">Edit website</LinkButton>}>
      <section className="status-banner"><div className="status-banner-icon"><Globe2 size={23} /></div><div><span><i /> Your website is live</span><h2>olive-and-ember.servesite.co</h2><p>Last published today at 9:42 AM</p></div><Link href="/site/olive-and-ember">View live site <ArrowRight size={16} /></Link></section>
      <section className="metrics-grid">
        <Metric icon={Eye} label="Website views" value="1,284" note="+18% from last month" positive />
        <Metric icon={MessageSquareText} label="Quote requests" value={String(state.leads.length + 9)} note="4 this week" />
        <Metric icon={Users} label="New leads" value={String(newLeads.length)} note="Needs your attention" attention />
        <Metric icon={MenuSquare} label="Top menu item" value={mostViewed?.name || "—"} note={`${mostViewed?.views || 0} views`} compact />
      </section>
      <div className="overview-grid">
        <section className="panel recent-leads-panel"><div className="panel-heading"><div><h2>Recent inquiries</h2><p>Your latest event requests.</p></div><Link href="/dashboard/leads">View all <ArrowRight size={15} /></Link></div>
          <div className="recent-lead-list">{state.leads.slice(0, 4).map(lead => <Link href="/dashboard/leads" key={lead.id}><div className="lead-initials">{lead.customerName.split(" ").map(value => value[0]).join("")}</div><div><strong>{lead.customerName}</strong><span>{lead.eventType} · {lead.guestCount} guests</span></div><div className="lead-date"><strong>{formatDate(lead.eventDate)}</strong><span>Received {formatDate(lead.receivedAt)}</span></div><Badge tone={lead.status === "New" ? "gold" : lead.status === "Quote sent" ? "blue" : "neutral"}>{lead.status}</Badge></Link>)}</div>
        </section>
        <aside className="overview-side">
          <section className="panel completion-panel"><div className="completion-ring"><svg viewBox="0 0 42 42"><circle cx="21" cy="21" r="16" /><circle className="progress" cx="21" cy="21" r="16" /></svg><strong>84%</strong></div><div><h3>Profile completion</h3><p>A few finishing touches will help more visitors convert.</p></div><ul><li className="done"><CheckCircle2 size={15} /> Business details</li><li className="done"><CheckCircle2 size={15} /> Menu published</li><li><span /> Add 3 more gallery images</li></ul><Link href="/dashboard/gallery">Complete profile <ArrowRight size={15} /></Link></section>
          <section className="panel activity-card"><div className="panel-heading"><div><h3>Activity</h3><p>Last 7 days</p></div><TrendingUp size={18} /></div><div className="mini-chart">{[32, 44, 38, 61, 52, 75, 68].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></section>
        </aside>
      </div>
      <section className="quick-actions"><h2>Quick actions</h2><div><Link href="/dashboard/menu"><MenuSquare size={19} /><span><strong>Add a menu item</strong><small>Keep your menu fresh</small></span><ArrowRight size={16} /></Link><Link href="/dashboard/design"><Paintbrush size={19} /><span><strong>Update your design</strong><small>Colors, fonts & layout</small></span><ArrowRight size={16} /></Link><Link href="/dashboard/leads"><Clock3 size={19} /><span><strong>Follow up on leads</strong><small>{newLeads.length} requests need attention</small></span><ArrowRight size={16} /></Link></div></section>
    </DashboardShell>
  );
}

function Metric({ icon: Icon, label, value, note, positive, attention, compact }: { icon: typeof Eye; label: string; value: string; note: string; positive?: boolean; attention?: boolean; compact?: boolean }) {
  return <article className="metric-card"><div><span className="metric-icon"><Icon size={18} /></span><small>{label}</small></div><strong className={compact ? "compact-value" : ""}>{value}</strong><p className={positive ? "positive" : attention ? "attention" : ""}>{positive && <TrendingUp size={13} />}{note}</p></article>;
}
