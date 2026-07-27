"use client";

import { X } from "lucide-react";
import { useState } from "react";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { Button, Field } from "./ui";

const dietaryLabels = ["Kosher", "Meat", "Dairy", "Pareve", "Vegetarian", "Vegan", "Gluten-free"];

export function MenuItemForm({ open, item, categories, onClose, onSave }: { open: boolean; item: MenuItem | null; categories: MenuCategory[]; onClose: () => void; onSave: (item: MenuItem) => void }) {
  if (!open || !item) return null;
  return <MenuItemFormBody key={item.id} item={item} categories={categories} onClose={onClose} onSave={onSave} />;
}

function MenuItemFormBody({ item, categories, onClose, onSave }: { item: MenuItem; categories: MenuCategory[]; onClose: () => void; onSave: (item: MenuItem) => void }) {
  const [form, setForm] = useState<MenuItem>(item);
  const update = (patch: Partial<MenuItem>) => setForm(current => current ? { ...current, ...patch } : current);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    onSave(form);
  };
  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="form-drawer" role="dialog" aria-modal="true" aria-labelledby="menu-form-title" onMouseDown={event => event.stopPropagation()}>
        <header><div><span>{form.id.startsWith("new") ? "New menu item" : "Edit menu item"}</span><h2 id="menu-form-title">{form.id.startsWith("new") ? "Add something delicious" : form.name}</h2></div><button onClick={onClose} aria-label="Close menu form"><X size={20} /></button></header>
        <form onSubmit={submit}>
          <Field label="Item name"><input required value={form.name} onChange={e => update({ name: e.target.value })} /></Field>
          <Field label="Description"><textarea required rows={4} value={form.description} onChange={e => update({ description: e.target.value })} /></Field>
          <div className="form-grid"><Field label="Price"><input value={form.price} onChange={e => update({ price: e.target.value })} placeholder="$24" /></Field><Field label="Pricing unit"><select value={form.pricingUnit} onChange={e => update({ pricingUnit: e.target.value as MenuItem["pricingUnit"] })}>{["Per person", "Per tray", "Per item", "Starting at", "Custom quote"].map(value => <option key={value}>{value}</option>)}</select></Field></div>
          <Field label="Category"><select value={form.categoryId} onChange={e => update({ categoryId: e.target.value })}>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field>
          <Field label="Image URL"><input type="url" value={form.image} onChange={e => update({ image: e.target.value })} /></Field>
          <Field label="Dietary labels"><div className="check-chip-list">{dietaryLabels.map(label => <label key={label}><input type="checkbox" checked={form.dietary.includes(label)} onChange={e => update({ dietary: e.target.checked ? [...form.dietary, label] : form.dietary.filter(value => value !== label) })} /><span>{label}</span></label>)}</div></Field>
          <Field label="Allergens" hint="Separate with commas"><input value={form.allergens.join(", ")} onChange={e => update({ allergens: e.target.value.split(",").map(value => value.trim()).filter(Boolean) })} placeholder="Nuts, dairy, sesame…" /></Field>
          <Field label="Minimum order"><input value={form.minimumOrder} onChange={e => update({ minimumOrder: e.target.value })} /></Field>
          <label className="availability-control"><span><strong>Available to order</strong><small>Unavailable items remain saved but are hidden from your public menu.</small></span><span className="switch"><input type="checkbox" checked={form.available} onChange={e => update({ available: e.target.checked })} /><i /></span></label>
          <div className="drawer-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save menu item</Button></div>
        </form>
      </aside>
    </div>
  );
}
