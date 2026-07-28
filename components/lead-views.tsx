"use client";

import { CalendarDays, GripVertical, Mail, MapPin, MessageCircle, Phone, Printer, Users } from "lucide-react";
import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types";
import { Badge } from "./ui";
import { useUpdateLeadStatus } from "./use-lead-status";
import { cn, formatDate } from "@/lib/utils";

export const statuses: LeadStatus[] = ["New", "Contacted", "Quote sent", "Won", "Lost"];

const tone = (status: LeadStatus) => status === "New" ? "gold" : status === "Quote sent" ? "blue" : status === "Won" ? "green" : status === "Lost" ? "red" : "neutral";

export function LeadTable({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  return <div className="table-wrap"><table className="data-table leads-table"><thead><tr><th>Customer</th><th>Event</th><th>Date</th><th>Guests</th><th>Budget</th><th>Received</th><th>Status</th></tr></thead><tbody>{leads.map(lead => <tr key={lead.id} onClick={() => onOpen(lead)} tabIndex={0} onKeyDown={event => event.key === "Enter" && onOpen(lead)}><td><div className="lead-customer"><span>{lead.customerName.split(" ").map(value => value[0]).join("")}</span><div><strong>{lead.customerName}</strong><small>{lead.email}</small></div></div></td><td><strong>{lead.eventType}</strong><small><MapPin size={12} /> {lead.eventLocation}</small></td><td>{formatDate(lead.eventDate)}</td><td>{lead.guestCount}</td><td>{lead.budget}</td><td>{formatDate(lead.receivedAt)}</td><td><Badge tone={tone(lead.status)}>{lead.status}</Badge></td></tr>)}</tbody></table></div>;
}

/**
 * The pipeline board. Cards drag between columns with a pointer and move with
 * Ctrl/⌘ + ← → from the keyboard — the same operation either way, each
 * confirmed by an undoable toast.
 */
export function LeadKanban({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  const updateStatus = useUpdateLeadStatus();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<LeadStatus | null>(null);

  const endDrag = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const drop = (status: LeadStatus) => {
    const lead = leads.find(entry => entry.id === draggingId);
    endDrag();
    if (lead) updateStatus(lead, status, { announce: true });
  };

  const onCardKeyDown = (event: React.KeyboardEvent, lead: Lead) => {
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next = statuses[statuses.indexOf(lead.status) + (event.key === "ArrowRight" ? 1 : -1)];
    if (next) updateStatus(lead, next, { announce: true });
  };

  return (
    <div className="kanban-board">
      {statuses.map(status => {
        const column = leads.filter(lead => lead.status === status);
        return (
          <section
            key={status}
            className={cn("kanban-column", `status-${status.toLowerCase().replace(" ", "-")}`, draggingId && dropTarget === status && "is-drop-target")}
            onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropTarget(status); }}
            onDragLeave={() => setDropTarget(current => (current === status ? null : current))}
            onDrop={event => { event.preventDefault(); drop(status); }}
          >
            <header><span><i />{status}</span><b>{column.length}</b></header>
            <div>
              {column.map(lead => (
                <button
                  className={cn("kanban-card", draggingId === lead.id && "is-dragging")}
                  key={lead.id}
                  draggable
                  onDragStart={event => { setDraggingId(lead.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", lead.id); }}
                  onDragEnd={endDrag}
                  onClick={() => onOpen(lead)}
                  onKeyDown={event => onCardKeyDown(event, lead)}
                  aria-describedby="kanban-move-hint"
                >
                  <div className="kanban-customer">
                    <span>{lead.customerName.split(" ").map(value => value[0]).join("")}</span>
                    <strong>{lead.customerName}</strong>
                    <GripVertical className="kanban-grip" size={14} aria-hidden="true" />
                  </div>
                  <h3>{lead.eventType}</h3>
                  <p><CalendarDays size={13} />{formatDate(lead.eventDate)}</p>
                  <p><Users size={13} />{lead.guestCount} guests</p>
                  <footer><span>{lead.budget}</span><small>{formatDate(lead.receivedAt)}</small></footer>
                </button>
              ))}
              {column.length === 0 && <div className="kanban-empty">{draggingId ? "Drop to move here" : "No leads here"}</div>}
            </div>
          </section>
        );
      })}
      <p id="kanban-move-hint" className="sr-only">Hold Control or Command and press the left or right arrow key to move this inquiry between stages.</p>
    </div>
  );
}

export function ContactButtons({ lead }: { lead: Lead }) {
  return (
    <div className="lead-contact-buttons">
      <a href={`mailto:${lead.email}`}><Mail size={16} /> Email</a>
      <a href={`tel:${lead.phone}`}><Phone size={16} /> Call</a>
      <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a>
      {/* The kitchen still runs on paper: the print stylesheet turns this
          drawer into a one-page event brief and hides everything else. */}
      <button type="button" onClick={() => window.print()}><Printer size={16} /> Print brief</button>
    </div>
  );
}
