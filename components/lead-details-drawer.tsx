"use client";

import { CalendarDays, Clock3, FilePlus2, MapPin, Send, Users, X } from "lucide-react";
import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types";
import { Button, Field } from "./ui";
import { ContactButtons, statuses } from "./lead-views";
import { businessInitials, formatDate, uid } from "@/lib/utils";
import { useApp } from "./app-provider";

export function LeadDetailsDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { state, setState, notify } = useApp();
  const [note, setNote] = useState("");
  if (!lead) return null;
  const updateStatus = (status: LeadStatus) => setState(current => ({ ...current, leads: current.leads.map(entry => entry.id === lead.id ? { ...entry, status } : entry) }));
  const addNote = () => {
    if (!note.trim()) return;
    setState(current => ({ ...current, leads: current.leads.map(entry => entry.id === lead.id ? { ...entry, notes: [...entry.notes, { id: uid("note"), text: note.trim(), createdAt: new Date().toISOString().slice(0, 10) }] } : entry) }));
    setNote("");
    notify("Internal note added");
  };
  return <div className="drawer-backdrop" onMouseDown={onClose}><aside className="lead-drawer" role="dialog" aria-modal="true" aria-labelledby="lead-title" onMouseDown={event => event.stopPropagation()}><header><div><span>Event inquiry</span><h2 id="lead-title">{lead.customerName}</h2><p>Received {formatDate(lead.receivedAt)}</p></div><button onClick={onClose} aria-label="Close lead details"><X size={20} /></button></header><div className="lead-drawer-content"><ContactButtons lead={lead} /><div className="lead-status-control"><Field label="Lead status"><select value={lead.status} onChange={e => updateStatus(e.target.value as LeadStatus)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></Field><Button variant="secondary" onClick={() => notify("Quote creation is coming soon")}><FilePlus2 size={16} /> Create quote <small>Coming soon</small></Button></div><section className="request-overview"><h3>Event overview</h3><div><span><CalendarDays size={16} /><small>Event date</small><strong>{formatDate(lead.eventDate)}{lead.eventTime && lead.eventTime !== "Not specified" ? ` · ${lead.eventTime}` : ""}</strong></span><span><Users size={16} /><small>Guest count</small><strong>{lead.guestCount} guests</strong></span><span><MapPin size={16} /><small>Location</small><strong>{lead.eventLocation}</strong></span><span><Clock3 size={16} /><small>Event type</small><strong>{lead.eventType}</strong></span></div></section><section className="request-details"><h3>Request details</h3><dl><div><dt>Estimated budget</dt><dd>{lead.budget}</dd></div><div><dt>Service style</dt><dd>{lead.serviceStyle}</dd></div><div><dt>Preferred menu</dt><dd>{lead.preferredMenu}</dd></div><div><dt>Dietary requirements</dt><dd>{lead.dietaryRequirements}</dd></div><div><dt>Preferred contact</dt><dd>{lead.preferredContact}</dd></div><div><dt>Heard about you via</dt><dd>{lead.hearAboutUs}</dd></div><div><dt>Additional details</dt><dd>{lead.details}</dd></div></dl></section><section className="notes-section"><h3>Internal notes</h3><div className="note-input"><textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Add a private note for your team…" /><Button onClick={addNote} disabled={!note.trim()}><Send size={15} /> Add note</Button></div>{lead.notes.length > 0 ? <div className="notes-list">{lead.notes.map(item => <article key={item.id}><div>{businessInitials(state.business.name)}</div><span><strong>{state.business.name}</strong><p>{item.text}</p><small>{formatDate(item.createdAt)}</small></span></article>)}</div> : <p className="no-notes">No internal notes yet.</p>}</section><section className="activity-timeline"><h3>Activity</h3><div><i /><span><strong>Inquiry received</strong><small>{formatDate(lead.receivedAt)}</small></span></div>{lead.status !== "New" && <div><i /><span><strong>Status changed to {lead.status}</strong><small>Updated in dashboard</small></span></div>}</section></div></aside></div>;
}
