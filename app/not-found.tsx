import { BrandMark, LinkButton } from "@/components/ui";

export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="empty-state" style={{ maxWidth: 480 }}>
        <BrandMark />
        <h3 style={{ marginTop: 18 }}>We couldn&apos;t find that page</h3>
        <p>The link may be out of date, or the page may have moved. Everything else is still where you left it.</p>
        <LinkButton href="/">Back to ServeSite</LinkButton>
      </div>
    </main>
  );
}
