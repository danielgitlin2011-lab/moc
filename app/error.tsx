"use client";

import { useEffect } from "react";
import { BrandMark, Button } from "@/components/ui";

export default function GlobalErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // The digest is the only handle on the server-side stack trace in production.
  useEffect(() => {
    console.error("ServeSite route error", error.digest ?? "", error);
  }, [error]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="empty-state" style={{ maxWidth: 480 }}>
        <BrandMark />
        <h3 style={{ marginTop: 18 }}>Something went wrong</h3>
        <p>We hit an unexpected error loading this page. You can try again, or head back to the dashboard.</p>
        <Button onClick={reset}>Try again</Button>
        {error.digest && <small style={{ marginTop: 12, color: "#96958f" }}>Reference: {error.digest}</small>}
      </div>
    </main>
  );
}
