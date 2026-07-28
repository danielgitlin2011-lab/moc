import { headers } from "next/headers";

/** The absolute origin this request arrived on, so metadata works on any deployment domain. */
export async function requestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
