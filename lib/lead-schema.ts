import { z } from "zod";

/** Today's calendar date, as the `YYYY-MM-DD` string the date input produces. */
export const today = () => new Date().toISOString().slice(0, 10);

/**
 * The shape of an event inquiry, shared by the browser form and the API route.
 *
 * One schema, two enforcement points: the form uses it to show field errors as
 * someone types, and `app/api/leads/route.ts` uses it to decide what actually
 * reaches the database. The second one is the control — the first is a
 * courtesy, and anyone can skip it.
 *
 * The lengths mirror the CHECK constraints in
 * supabase/migrations/20260728160000_*.sql so a value rejected by Postgres is
 * rejected here first, with a message a person can act on.
 */
export const leadSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(120, "That name is too long"),
  email: z.email("Enter a valid email address").max(254, "That email address is too long"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(40, "That phone number is too long"),
  eventDate: z.string().min(1, "Choose an event date").refine(value => value >= today(), "Choose a date in the future"),
  eventTime: z.string().trim().max(40).optional(),
  eventLocation: z.string().trim().min(2, "Enter an event location").max(200, "That location is too long"),
  eventType: z.string().trim().min(1, "Choose an event type").max(80),
  guestCount: z.coerce.number().int().min(2, "Enter at least 2 guests").max(100_000, "That guest count looks too high"),
  budget: z.string().trim().min(1, "Choose an estimated budget").max(80),
  serviceStyle: z.string().trim().max(120).optional(),
  preferredMenu: z.string().trim().max(300).optional(),
  dietaryRequirements: z.string().trim().max(500).optional(),
  details: z.string().trim().min(10, "Share a little more about your event").max(4000, "Please shorten your description"),
  preferredContact: z.string().trim().min(1).max(40),
  hearAboutUs: z.string().trim().max(120).optional(),
  source: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(300).optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadValues = z.infer<typeof leadSchema>;
