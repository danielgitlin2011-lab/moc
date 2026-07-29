/**
 * Stock photography for businesses that haven't uploaded their own images
 * yet. Every URL reuses a photo id already relied on elsewhere in this app
 * (template previews, marketing pages, the gallery's demo images), so
 * nothing new is being pulled in — this just makes the same known-good
 * photography choosable from any image field, grouped by what it's for.
 */
export type ImageBankCategory = "hero" | "about" | "service" | "menu" | "gallery";

const photos = {
  editorialTable: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f",
  modernSpread: "https://images.unsplash.com/photo-1547592180-85f173990554",
  warmGathering: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7",
  coastalTable: "https://images.unsplash.com/photo-1470337458703-46ad1756a187",
  noirPlate: "https://images.unsplash.com/photo-1544025162-d76694265947",
  receptionRoom: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3",
  eventTables: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3",
  platedFood: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c",
  diningTable: "https://images.unsplash.com/photo-1555244162-803834f70033",
} as const;

const bank: Record<ImageBankCategory, readonly string[]> = {
  hero: [photos.diningTable, photos.editorialTable, photos.coastalTable, photos.noirPlate],
  about: [photos.editorialTable, photos.warmGathering, photos.platedFood, photos.modernSpread],
  service: [photos.platedFood, photos.modernSpread, photos.warmGathering, photos.eventTables],
  menu: [photos.modernSpread, photos.platedFood, photos.noirPlate, photos.warmGathering],
  gallery: [photos.receptionRoom, photos.eventTables, photos.platedFood, photos.diningTable],
};

export function imageBankFor(category: ImageBankCategory): readonly string[] {
  return bank[category];
}
