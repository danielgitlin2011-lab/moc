"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div className="empty-state" style={{ maxWidth: 480 }}>
            <h3>Something went wrong</h3>
            <p>ServeSite hit an unexpected error. Please try again in a moment.</p>
            <button className="button button-primary" onClick={reset}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}
