import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/lead-schema";
import { clientAddress, createRateLimiter } from "@/lib/rate-limit";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ten inquiries an hour from one address is far beyond any real planning
 * session and well under what a script would attempt.
 */
const limitByAddress = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

const requestSchema = z.object({
  businessId: z.string().regex(UUID, "Unknown business"),
  lead: leadSchema,
  /** The form field only a bot fills in. */
  honeypot: z.string().optional(),
  /** Milliseconds the form was open before submitting. */
  elapsedMs: z.number().nonnegative().optional(),
});

/**
 * Creates an event inquiry.
 *
 * This exists because the previous design had the browser insert straight into
 * `leads` with the anon key: the honeypot and the timing check lived in the
 * client, so skipping them meant not running the client. Validation that
 * matters has to run where the caller cannot reach it.
 *
 * Three layers, in order of trustworthiness:
 *  - here: request shape, zod validation, honeypot, timing, per-IP ceiling;
 *  - `public.submit_lead`: business must exist and be published, per-business
 *    ceiling, values trimmed and truncated;
 *  - CHECK constraints on the table itself.
 *
 * Only the last two survive someone calling PostgREST directly, which is why
 * the anon INSERT policy is removed in the companion migration.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    // Field-level detail goes back so the form can point at what to fix, but
    // never anything about the business or the database.
    const fields = parsed.error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message }));
    return Response.json({ error: "Please check the highlighted fields.", fields }, { status: 400 });
  }

  const { businessId, lead, honeypot, elapsedMs } = parsed.data;

  // A filled honeypot, or a submission faster than a person can type, is a bot.
  // Both get the same success-shaped response a real submission gets: telling a
  // script which check caught it only helps it tune.
  if (honeypot?.trim() || (elapsedMs !== undefined && elapsedMs < 2500)) {
    return Response.json({ ok: true }, { status: 202 });
  }

  const { ok, retryAfter } = limitByAddress(clientAddress(request));
  if (!ok) {
    return Response.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_lead", {
    p_business_id: businessId,
    p_customer_name: lead.customerName,
    p_email: lead.email,
    p_phone: lead.phone,
    p_event_date: lead.eventDate,
    p_event_time: lead.eventTime ?? "",
    p_event_location: lead.eventLocation,
    p_event_type: lead.eventType,
    p_guest_count: lead.guestCount,
    p_budget: lead.budget,
    p_service_style: lead.serviceStyle ?? "",
    p_preferred_menu: lead.preferredMenu ?? "",
    p_dietary_requirements: lead.dietaryRequirements ?? "",
    p_details: lead.details,
    p_preferred_contact: lead.preferredContact,
    p_hear_about_us: lead.hearAboutUs ?? "",
    p_source: lead.source ?? "",
    p_referrer: lead.referrer ?? "",
  });

  if (error) {
    // The function raises `rate_limited` once a single business is being
    // flooded, whatever address it comes from.
    if (error.message?.includes("rate_limited")) {
      return Response.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    if (error.message?.includes("business_not_available")) {
      return Response.json({ error: "This website is not accepting requests right now." }, { status: 404 });
    }
    return Response.json({ error: "Your request could not be sent. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true }, { status: 201 });
}
