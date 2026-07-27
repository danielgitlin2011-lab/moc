"use client";

import { CalendarDays, Mail, MapPin, MessageCircle, Phone, Users } from "lucide-react";
import type { Lead, LeadStatus } from "@/lib/types";
import { Badge } from "./ui";
import { formatDate } from "@/lib/utils";

export const statuses: LeadStatus[] = ["New", "Contacted", "Quote sent", "Won", "Lost"];

const tone = (status: LeadStatus) => status === "New" ? "gold" : status === "Quote sent" ? "blue" : status === "Won" ? "green" : status === "Lost" ? "red" : "neutral";

export function LeadTable({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  return <div className="table-wrap"><table className="data-table leads-table"><thead><tr><th>Customer</th><th>Event</th><th>Date</th><th>Guests</th><th>Budget</th><th>Received</th><th>Status</th></tr></thead><tbody>{leads.map(lead => <tr key={lead.id} onClick={() => onOpen(lead)} tabIndex={0} onKeyDown={event => event.key === "Enter" && onOpen(lead)}><td><div className="lead-customer"><span>{lead.customerName.split(" ").map(value => value[0]).join("")}</span><div><strong>{lead.customerName}</strong><small>{lead.email}</small></div></div></td><td><strong>{lead.eventType}</strong><small><MapPin size={12} /> {lead.eventLocation}</small></td><td>{formatDate(lead.eventDate)}</td><td>{lead.guestCount}</td><td>{lead.budget}</td><td>{formatDate(lead.receivedAt)}</td><td><Badge tone={tone(lead.status)}>{lead.status}</Badge></td></tr>)}</tbody></table></div>;
}

export function LeadKanban({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  return <div className="kanban-board">{statuses.map(status => { const column = leads.filter(lead => lead.status === status); return <section key={status} className={`kanban-column status-${status.toLowerCase().replace(" ", "-")}`}><header><span><i />{status}</span><b>{column.length}</b></header><div>{column.map(lead => <button className="kanban-card" key={lead.id} onClick={() => onOpen(lead)}><div className="kanban-customer"><span>{lead.customerName.split(" ").map(value => value[0]).join("")}</span><strong>{lead.customerName}</strong></div><h3>{lead.eventType}</h3><p><CalendarDays size={13} />{formatDate(lead.eventDate)}</p><p><Users size={13} />{lead.guestCount} guests</p><footer><span>{lead.budget}</span><small>{formatDate(lead.receivedAt)}</small></footer></button>)}{column.length === 0 && <div className="kanban-empty">No leads here</div>}</div></section>; })}</div>;
}

export function ContactButtons({ lead }: { lead: Lead }) {
  return <div className="lead-contact-buttons"><a href={`mailto:${lead.email}`}><Mail size={16} /> Email</a><a href={`tel:${lead.phone}`}><Phone size={16} /> Call</a><a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> WhatsApp</a></div>;
}
