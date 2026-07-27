"use client";

import { ArrowDown, ArrowUp, Copy, Grid2X2, List, Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { MenuItemCard } from "@/components/menu-item-card";
import { MenuItemForm } from "@/components/menu-item-form";
import { useApp } from "@/components/app-provider";
import { Badge, Button, ConfirmDialog, EmptyState } from "@/components/ui";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { cn, uid } from "@/lib/utils";

const blankItem = (categoryId: string): MenuItem => ({
  id: `new-${Date.now()}`,
  name: "",
  description: "",
  price: "",
  pricingUnit: "Per person",
  image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  categoryId,
  dietary: ["Kosher"],
  allergens: [],
  ingredients: "",
  servingSize: "",
  preparation: "",
  leadTime: "72 hours",
  minimumOrder: "10 guests",
  seasonal: "Year round",
  featured: false,
  available: true,
  views: 0,
});

export default function MenuPage() {
  const { state, setState, notify } = useApp();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [managingCategories, setManagingCategories] = useState(false);

  const filtered = useMemo(() => state.menuItems.filter(item => (filter === "all" || item.categoryId === filter) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [state.menuItems, filter, search]);
  const save = (item: MenuItem) => {
    setState(current => ({ ...current, menuItems: current.menuItems.some(entry => entry.id === item.id) ? current.menuItems.map(entry => entry.id === item.id ? item : entry) : [{ ...item, id: uid("menu") }, ...current.menuItems] }));
    setEditing(null);
    notify("Menu item saved");
  };
  const duplicate = (item: MenuItem) => {
    setState(current => ({ ...current, menuItems: [{ ...item, id: uid("menu"), name: `${item.name} copy`, views: 0 }, ...current.menuItems] }));
    notify("Menu item duplicated");
  };
  const toggle = (item: MenuItem) => setState(current => ({ ...current, menuItems: current.menuItems.map(entry => entry.id === item.id ? { ...entry, available: !entry.available } : entry) }));

  return (
    <DashboardShell title="Menu" description={`${state.menuItems.length} items across ${state.categories.length} categories`} actions={<Button onClick={() => setEditing(blankItem(state.categories[0]?.id || ""))}><Plus size={17} /> Add menu item</Button>}>
      <div className="menu-toolbar"><div className="search-field"><Search size={17} /><input aria-label="Search menu items" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…" /></div><select aria-label="Filter by category" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All categories</option>{state.categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select><Button variant="secondary" onClick={() => setManagingCategories(true)}>Manage categories</Button><div className="view-toggle"><button className={cn(view === "grid" && "active")} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={17} /></button><button className={cn(view === "table" && "active")} onClick={() => setView("table")} aria-label="Table view"><List size={18} /></button></div></div>
      {filtered.length === 0 ? <EmptyState icon={<UtensilsCrossed />} title="No menu items found" body="Try another search or add your first item to this category." action={<Button onClick={() => setEditing(blankItem(state.categories[0]?.id || ""))}><Plus size={16} /> Add item</Button>} /> : view === "grid" ? <div className="menu-grid">{filtered.map(item => <MenuItemCard key={item.id} item={item} category={state.categories.find(category => category.id === item.categoryId)} onEdit={() => setEditing(item)} onDuplicate={() => duplicate(item)} onToggle={() => toggle(item)} onDelete={() => setDeleting(item)} />)}</div> : <div className="table-wrap"><table className="data-table menu-table"><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Dietary</th><th>Availability</th><th aria-label="Actions" /></tr></thead><tbody>{filtered.map(item => <tr key={item.id}><td><div className="table-menu-item"><img src={item.image} alt="" /><span><strong>{item.name}</strong><small>{item.description}</small></span></div></td><td>{state.categories.find(category => category.id === item.categoryId)?.name}</td><td><strong>{item.price}</strong><small>{item.pricingUnit}</small></td><td><div className="table-badges">{item.dietary.slice(0, 2).map(label => <Badge key={label}>{label}</Badge>)}</div></td><td><button className={cn("availability-badge", item.available && "available")} onClick={() => toggle(item)}><i />{item.available ? "Available" : "Unavailable"}</button></td><td><div className="row-actions"><button onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}><Pencil size={15} /></button><button onClick={() => duplicate(item)} aria-label={`Duplicate ${item.name}`}><Copy size={15} /></button><button onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>}
      <MenuItemForm open={!!editing} item={editing} categories={state.categories} onClose={() => setEditing(null)} onSave={save} />
      <ConfirmDialog open={!!deleting} title="Delete this menu item?" body={`${deleting?.name || "This item"} will be removed from your dashboard and website.`} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) setState(current => ({ ...current, menuItems: current.menuItems.filter(item => item.id !== deleting.id) })); setDeleting(null); notify("Menu item deleted"); }} />
      {managingCategories && <CategoryManager onClose={() => setManagingCategories(false)} />}
    </DashboardShell>
  );
}

function CategoryManager({ onClose }: { onClose: () => void }) {
  const { state, setState, notify } = useApp();
  const [name, setName] = useState("");
  const move = (index: number, direction: -1 | 1) => setState(current => {
    const target = index + direction;
    if (target < 0 || target >= current.categories.length) return current;
    const categories = [...current.categories];
    [categories[index], categories[target]] = [categories[target], categories[index]];
    return { ...current, categories };
  });
  const patch = (id: string, values: Partial<MenuCategory>) => setState(current => ({ ...current, categories: current.categories.map(entry => entry.id === id ? { ...entry, ...values } : entry) }));
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="category-dialog" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}><header><div><span>Menu structure</span><h2>Manage categories</h2></div><button onClick={onClose}>Done</button></header><p className="category-hint">Category names become the tabs on your website. The description appears above the dishes in that tab.</p><div className="category-list">{state.categories.map((category, index) => <div key={category.id}><span>{index + 1}</span><div className="category-fields"><input aria-label={`${category.name} category name`} value={category.name} onChange={e => patch(category.id, { name: e.target.value })} /><input aria-label={`${category.name} description`} value={category.description} onChange={e => patch(category.id, { description: e.target.value })} placeholder="Short description shown on your website" /></div><button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><ArrowUp size={15} /></button><button onClick={() => move(index, 1)} disabled={index === state.categories.length - 1} aria-label="Move down"><ArrowDown size={15} /></button><button className="danger-text" aria-label="Delete category" onClick={() => { if (state.menuItems.some(item => item.categoryId === category.id)) { notify("Move or delete items in this category first"); return; } setState(current => ({ ...current, categories: current.categories.filter(entry => entry.id !== category.id) })); }}><Trash2 size={15} /></button></div>)}</div><form onSubmit={e => { e.preventDefault(); if (!name.trim()) return; setState(current => ({ ...current, categories: [...current.categories, { id: uid("category"), name, description: "" }] })); setName(""); }}><input value={name} onChange={e => setName(e.target.value)} placeholder="New category name" /><Button type="submit"><Plus size={15} /> Add category</Button></form></div></div>;
}
