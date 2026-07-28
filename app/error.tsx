"use client";

import { BrandMark, Button } from "@/components/ui";

export default function GlobalErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="empty-state" style={{ maxWidth: 480 }}>
        <BrandMark />
        <h3 style={{ marginTop: 18 }}>Something went wrong</h3>
        <p>We hit an unexpected error loading this page. You can try again, or head back to the dashboard.</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
