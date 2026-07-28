import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const botPattern = /bot|crawler|spider|crawling|preview|facebookexternalhit|slurp|lighthouse|headless|monitor|curl|wget|python-requests/i;

/**
 * Records one website view for a published business. The counter itself is
 * written by a security-definer function, so visitors never touch the table
 * directly and unpublished sites are silently ignored.
 */
export async function POST(request: Request) {
  if (botPattern.test(request.headers.get("user-agent") || "")) {
    return new Response(null, { status: 204 });
  }

  let businessId: unknown;
  try {
    ({ businessId } = (await request.json()) as { businessId?: unknown });
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof businessId !== "string" || !UUID.test(businessId)) {
    return Response.json({ error: "Invalid business reference." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("record_site_visit", { p_business_id: businessId });

  if (error) return Response.json({ error: "Could not record the visit." }, { status: 502 });

  return new Response(null, { status: 204 });
}
