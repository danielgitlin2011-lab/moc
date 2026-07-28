"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Eye, Globe2, MenuSquare, MessageSquareText, Paintbrush, TrendingDown, TrendingUp, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge, LinkButton } from "@/components/ui";
import { useApp } from "@/components/app-provider";
import { formatDate, relativeTime } from "@/lib/utils";
import { leadSummary, leadTrend, profileCompletion, topMenuItems, viewSummary, viewTrend } from "@/lib/analytics";

export default function DashboardPage() {
  const { state } = useApp();
  const leads = leadSummary(state.leads);
  const views = viewSummary(state.visits, 30);
  const completion = profileCompletion(state);
  const topItem = topMenuItems(state, 1)[0];
  const trend = views.hasData ? viewTrend(state.visits) : leadTrend(state.leads);
  const trendLabel = views.hasData ? "Website views" : "Inquiries received";
  const greeting = state.business.name ? `Welcome back, ${state.business.name}` : "Welcome back";

  return (
    <DashboardShell title={greeting} description="Everything below reflects your live data." actions={<LinkButton href="/dashboard/website">Edit website</LinkButton>}>
      <section className={`status-banner ${state.business.published ? "" : "status-banner-offline"}`}>
        <div className="status-banner-icon"><Globe2 size={23} /></div>
        <div>
          <span><i /> {state.business.published ? "Your website is live" : "Your website is not published"}</span>
          <h2>{state.business.slug}.servesite.co</h2>
          <p>
            {state.business.published
              ? state.publishedAt ? `Published ${formatDate(state.publishedAt)} · ${relativeTime(state.publishedAt)}` : "Published"
              : "Publish from Settings to make this address reachable."}
          </p>
        </div>
        {state.business.published
          ? <Link href={`/site/${state.business.slug}`}>View live site <ArrowRight size={16} /></Link>
          : <Link href="/dashboard/settings">Publish your site <ArrowRight size={16} /></Link>}
      </section>

      <section className="metrics-grid">
        <Metric
          icon={Eye}
          label="Website views · 30 days"
          value={views.hasData ? views.total.toLocaleString() : "—"}
          note={
            views.hasData
              ? views.change === null ? "First 30 days of tracking" : `${views.change >= 0 ? "+" : ""}${views.change}% vs previous 30 days`
              : state.business.published ? "Waiting for the first visitor" : "Publish your site to start tracking"
          }
          direction={views.hasData && views.change !== null ? (views.change >= 0 ? "up" : "down") : undefined}
        />
        <Metric
          icon={MessageSquareText}
          label="Quote requests"
          value={String(leads.total)}
          note={leads.thisWeek > 0 ? `${leads.thisWeek} in the last 7 days` : "None in the last 7 days"}
        />
        <Metric
          icon={Users}
          label="New leads"
          value={String(leads.newCount)}
          note={leads.newCount > 0 ? "Needs your attention" : "All inquiries triaged"}
          attention={leads.newCount > 0}
        />
        <Metric
          icon={MenuSquare}
          label={topItem ? "Most viewed dish" : "Booking rate"}
          value={topItem ? topItem.name : leads.bookingRate === null ? "—" : `${leads.bookingRate}%`}
          note={topItem ? `${topItem.views} views` : leads.bookingRate === null ? "Shown once inquiries are won or lost" : `${leads.wonCount} won of ${leads.wonCount + leads.lostCount} decided`}
          compact={Boolean(topItem)}
        />
      </section>

      <div className="overview-grid">
        <section className="panel recent-leads-panel">
          <div className="panel-heading">
            <div><h2>Recent inquiries</h2><p>Your latest event requests.</p></div>
            <Link href="/dashboard/leads">View all <ArrowRight size={15} /></Link>
          </div>
          {state.leads.length > 0 ? (
            <div className="recent-lead-list">
              {state.leads.slice(0, 4).map(lead => (
                <Link href="/dashboard/leads" key={lead.id}>
                  <div className="lead-initials">{lead.customerName.split(" ").map(value => value[0]).join("")}</div>
                  <div><strong>{lead.customerName}</strong><span>{lead.eventType} · {lead.guestCount} guests</span></div>
                  <div className="lead-date"><strong>{formatDate(lead.eventDate)}</strong><span>Received {relativeTime(lead.receivedAt)}</span></div>
                  <Badge tone={lead.status === "New" ? "gold" : lead.status === "Quote sent" ? "blue" : lead.status === "Won" ? "green" : "neutral"}>{lead.status}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="panel-empty">
              <MessageSquareText size={22} />
              <strong>No inquiries yet</strong>
              <p>Every request sent through your website&apos;s quote form lands here.</p>
            </div>
          )}
        </section>

        <aside className="overview-side">
          <section className="panel completion-panel">
            <div className="completion-ring">
              <svg viewBox="0 0 42 42" aria-hidden="true">
                <circle cx="21" cy="21" r="16" />
                <circle className="progress" cx="21" cy="21" r="16" style={{ strokeDasharray: `${completion.percentage} 100` }} />
              </svg>
              <strong>{completion.percentage}%</strong>
            </div>
            <div>
              <h3>Profile completion</h3>
              <p>{completion.remaining.length === 0 ? "Everything is filled in — nicely done." : `${completion.remaining.length} item${completion.remaining.length === 1 ? "" : "s"} left to finish.`}</p>
            </div>
            <ul>
              {completion.items.filter(item => item.done).slice(0, 2).map(item => <li className="done" key={item.id}><CheckCircle2 size={15} /> {item.label}</li>)}
              {completion.remaining.slice(0, 3).map(item => <li key={item.id}><span /> {item.label}</li>)}
            </ul>
            {completion.remaining[0] && <Link href={completion.remaining[0].href}>Complete profile <ArrowRight size={15} /></Link>}
          </section>

          <section className="panel activity-card">
            <div className="panel-heading">
              <div><h3>{trendLabel}</h3><p>Last 7 days</p></div>
              <TrendingUp size={18} />
            </div>
            <MiniChart points={trend} />
            <div className="chart-labels">{trend.map(point => <span key={point.date}>{point.label}</span>)}</div>
          </section>
        </aside>
      </div>

      <section className="quick-actions">
        <h2>Quick actions</h2>
        <div>
          <Link href="/dashboard/menu"><MenuSquare size={19} /><span><strong>Add a menu item</strong><small>{state.menuItems.length} on your menu</small></span><ArrowRight size={16} /></Link>
          <Link href="/dashboard/design"><Paintbrush size={19} /><span><strong>Update your design</strong><small>Colors, fonts &amp; layout</small></span><ArrowRight size={16} /></Link>
          <Link href="/dashboard/leads"><Clock3 size={19} /><span><strong>Follow up on leads</strong><small>{leads.newCount > 0 ? `${leads.newCount} request${leads.newCount === 1 ? "" : "s"} need attention` : "Nothing waiting"}</small></span><ArrowRight size={16} /></Link>
        </div>
      </section>
    </DashboardShell>
  );
}

function MiniChart({ points }: { points: { date: string; label: string; value: number }[] }) {
  const peak = Math.max(...points.map(point => point.value), 1);
  const empty = points.every(point => point.value === 0);
  return (
    <div className={`mini-chart ${empty ? "is-empty" : ""}`} role="img" aria-label={points.map(point => `${point.label}: ${point.value}`).join(", ")}>
      {points.map(point => <i key={point.date} style={{ height: `${Math.max(3, (point.value / peak) * 100)}%` }} />)}
      {empty && <small>Nothing recorded yet</small>}
    </div>
  );
}

function Metric({ icon: Icon, label, value, note, direction, attention, compact }: {
  icon: typeof Eye;
  label: string;
  value: string;
  note: string;
  direction?: "up" | "down";
  attention?: boolean;
  compact?: boolean;
}) {
  return (
    <article className="metric-card">
      <div><span className="metric-icon"><Icon size={18} /></span><small>{label}</small></div>
      <strong className={compact ? "compact-value" : ""}>{value}</strong>
      <p className={direction === "up" ? "positive" : direction === "down" ? "negative" : attention ? "attention" : ""}>
        {direction === "up" && <TrendingUp size={13} />}
        {direction === "down" && <TrendingDown size={13} />}
        {note}
      </p>
    </article>
  );
}
