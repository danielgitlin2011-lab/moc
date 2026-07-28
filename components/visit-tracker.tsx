"use client";

import { useEffect } from "react";

/**
 * Counts one website view per browser session, so a host refreshing their own
 * page does not inflate the number their caterer sees in the dashboard.
 */
export function VisitTracker({ businessId }: { businessId: string }) {
  useEffect(() => {
    const key = `servesite-visit:${businessId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing modes can block sessionStorage; count the view anyway.
    }

    const controller = new AbortController();
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ businessId }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // Analytics must never interrupt the visitor's experience.
    });

    return () => controller.abort();
  }, [businessId]);

  return null;
}
