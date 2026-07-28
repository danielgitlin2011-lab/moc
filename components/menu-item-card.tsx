"use client";

import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "./ui";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { SiteImage } from "./site-image";

export function MenuItemCard({ item, category, onEdit, onDuplicate, onToggle, onDelete }: { item: MenuItem; category?: MenuCategory; onEdit: () => void; onDuplicate: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <article className={`menu-item-card ${!item.available ? "unavailable" : ""}`}>
      <div className="menu-card-image"><SiteImage src={item.image} alt={item.name} width={600} /><span>{item.available ? "Available" : "Unavailable"}</span><details><summary aria-label={`Actions for ${item.name}`}><MoreHorizontal size={18} /></summary><div><button onClick={onEdit}><Pencil size={14} /> Edit</button><button onClick={onDuplicate}><Copy size={14} /> Duplicate</button><button onClick={onToggle}>{item.available ? "Mark unavailable" : "Mark available"}</button><button className="danger-text" onClick={onDelete}><Trash2 size={14} /> Delete</button></div></details></div>
      <div className="menu-card-copy"><small>{category?.name}</small><h3>{item.name}</h3><p>{item.description}</p><div className="dietary-row">{item.dietary.slice(0, 3).map(label => <Badge key={label}>{label}</Badge>)}</div><footer><strong>{item.price}</strong><span>{item.pricingUnit}</span></footer></div>
    </article>
  );
}
