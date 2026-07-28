"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Images, Plus, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useApp } from "@/components/app-provider";
import { Button, ConfirmDialog, EmptyState, Field } from "@/components/ui";
import type { GalleryImage } from "@/lib/types";
import { uid } from "@/lib/utils";
import { ImageUploader } from "@/components/image-uploader";
import { createClient } from "@/lib/supabase/client";
import { galleryImageToRow } from "@/lib/supabase/mappers";
import { SiteImage } from "@/components/site-image";

const galleryCategories = ["Weddings", "Private dinners", "Corporate events", "Shabbat", "Food presentation"];
const seeded = [
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
];

export default function GalleryPage() {
  const { state, setState, businessId, notify } = useApp();
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);

  const persistPatch = async (id: string, patch: Partial<GalleryImage>) => {
    try {
      const row = galleryImageToRow(patch);
      const { error } = await createClient().from("gallery_images").update(row).eq("business_id", businessId).eq("id", id);
      if (error) throw error;
    } catch (err) {
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };
  const persistFeatured = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: clearError } = await supabase.from("gallery_images").update({ featured: false }).eq("business_id", businessId);
      if (clearError) throw clearError;
      const { error: setError } = await supabase.from("gallery_images").update({ featured: true }).eq("business_id", businessId).eq("id", id);
      if (setError) throw setError;
    } catch (err) {
      notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
    }
  };

  const update = (id: string, patch: Partial<GalleryImage>) => {
    setState(current => ({ ...current, gallery: current.gallery.map(image => image.id === id ? { ...image, ...patch } : patch.featured ? { ...image, featured: false } : image) }));
    if (patch.featured) {
      void persistFeatured(id);
    } else {
      void persistPatch(id, patch);
    }
  };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.gallery.length) return;
    const atIndex = state.gallery[index];
    const atTarget = state.gallery[target];
    setState(current => {
      const gallery = [...current.gallery];
      [gallery[index], gallery[target]] = [gallery[target], gallery[index]];
      return { ...current, gallery };
    });
    void (async () => {
      try {
        const supabase = createClient();
        const [{ error: errorA }, { error: errorB }] = await Promise.all([
          supabase.from("gallery_images").update({ position: target }).eq("business_id", businessId).eq("id", atIndex.id),
          supabase.from("gallery_images").update({ position: index }).eq("business_id", businessId).eq("id", atTarget.id),
        ]);
        if (errorA || errorB) throw errorA || errorB;
      } catch (err) {
        notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
      }
    })();
  };
  return (
    <DashboardShell title="Gallery" description="Curate the moments that show clients what working with you feels like." actions={<Button onClick={() => setAdding(true)}><ImagePlus size={17} /> Add image</Button>}>
      <div className="gallery-summary"><div><Images size={20} /><span><strong>{state.gallery.length} images</strong><small>Across {new Set(state.gallery.map(image => image.category)).size} collections</small></span></div><p>Tip: Lead with complete table scenes, then layer in food and behind-the-scenes details.</p></div>
      {state.gallery.length === 0 ? <EmptyState icon={<Images />} title="Your gallery is waiting" body="Add event imagery to help potential clients picture their own gathering." action={<Button onClick={() => setAdding(true)}><Plus size={16} /> Add first image</Button>} /> : <div className="gallery-management-grid">{state.gallery.map((image, index) => <article key={image.id} className={image.featured ? "featured" : ""}><div className="gallery-image-wrap"><SiteImage src={image.url} fallback={seeded[0]} alt={image.caption} width={600} />{image.featured && <span><Star size={13} fill="currentColor" /> Featured</span>}<div className="gallery-image-actions"><button onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move image left"><ArrowLeft size={16} /></button><button onClick={() => move(index, 1)} disabled={index === state.gallery.length - 1} aria-label="Move image right"><ArrowRight size={16} /></button><button onClick={() => setDeleting(image)} aria-label={`Delete ${image.caption}`}><Trash2 size={16} /></button></div></div><div className="gallery-card-fields"><input aria-label="Image caption" value={image.caption} onChange={e => update(image.id, { caption: e.target.value })} placeholder="Caption" /><select aria-label="Gallery category" value={image.category} onChange={e => update(image.id, { category: e.target.value })}>{galleryCategories.map(category => <option key={category}>{category}</option>)}</select><input aria-label="Event type" value={image.eventType} onChange={e => update(image.id, { eventType: e.target.value })} placeholder="Event type" /><input aria-label="Guest count" value={image.guestCount} onChange={e => update(image.id, { guestCount: e.target.value })} placeholder="Guests" /><input aria-label="Location" value={image.location} onChange={e => update(image.id, { location: e.target.value })} placeholder="Venue or city" /><button className={image.featured ? "featured-control active" : "featured-control"} onClick={() => update(image.id, { featured: true })}><Star size={14} />{image.featured ? "Featured image" : "Set as featured"}</button></div></article>)}</div>}
      {adding && <AddImageDialog onClose={() => setAdding(false)} />}
      <ConfirmDialog open={!!deleting} title="Delete this gallery image?" body="The image will be removed from your dashboard and public website." onCancel={() => setDeleting(null)} onConfirm={() => {
        if (deleting) {
          const id = deleting.id;
          setState(current => ({ ...current, gallery: current.gallery.filter(image => image.id !== id) }));
          void (async () => {
            try {
              const { error } = await createClient().from("gallery_images").delete().eq("business_id", businessId).eq("id", id);
              if (error) throw error;
            } catch (err) {
              notify(err instanceof Error ? `Couldn't delete: ${err.message}` : "Couldn't delete image");
            }
          })();
        }
        setDeleting(null);
        notify("Gallery image deleted");
      }} />
    </DashboardShell>
  );
}

function AddImageDialog({ onClose }: { onClose: () => void }) {
  const { state, setState, businessId, notify } = useApp();
  const [url, setUrl] = useState(seeded[0]);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState(galleryCategories[0]);
  const [eventType, setEventType] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [location, setLocation] = useState("");
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const tempId = uid("gallery");
    const position = state.gallery.length;
    const created: GalleryImage = { id: tempId, url, caption: caption || `A recent ${state.business.name} gathering`, category, eventType, guestCount, location, featured: state.gallery.length === 0 };
    setState(current => ({ ...current, gallery: [...current.gallery, created] }));
    notify("Image added to gallery");
    onClose();
    void (async () => {
      try {
        const row = { ...galleryImageToRow(created), business_id: businessId, position };
        const { data, error } = await createClient().from("gallery_images").insert(row).select("id").single();
        if (error) throw error;
        setState(current => ({ ...current, gallery: current.gallery.map(image => image.id === tempId ? { ...image, id: data.id } : image) }));
      } catch (err) {
        notify(err instanceof Error ? `Couldn't save: ${err.message}` : "Couldn't save changes");
      }
    })();
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="add-image-dialog" role="dialog" aria-modal="true" onMouseDown={e => e.stopPropagation()}><header><div><span>New gallery image</span><h2>Add a moment</h2></div><button onClick={onClose} aria-label="Close"><X size={20} /></button></header><form onSubmit={save}><Field label="Upload from your device"><ImageUploader value={url} onChange={setUrl} label="Choose or drop an event image" /></Field><Field label="Or paste an image URL"><input required type="url" value={url} onChange={e => setUrl(e.target.value)} /></Field><div className="seeded-images"><span>Or choose a demo image</span><div>{seeded.map(image => <button type="button" className={url === image ? "active" : ""} onClick={() => setUrl(image)} key={image}><SiteImage src={image} alt="" width={220} /></button>)}</div></div><Field label="Caption"><input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Describe this moment" /></Field><Field label="Category"><select value={category} onChange={e => setCategory(e.target.value)}>{galleryCategories.map(value => <option key={value}>{value}</option>)}</select></Field><div className="form-grid"><Field label="Event type" hint="Shown in the lightbox"><input value={eventType} onChange={e => setEventType(e.target.value)} placeholder="Wedding, corporate lunch…" /></Field><Field label="Guest count"><input value={guestCount} onChange={e => setGuestCount(e.target.value)} placeholder="120 guests" /></Field></div><Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue or city" /></Field><div className="dialog-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Add to gallery</Button></div></form></div></div>;
}
