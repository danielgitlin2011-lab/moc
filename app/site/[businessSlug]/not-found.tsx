import { BrandMark, LinkButton } from "@/components/ui";

export default function BusinessNotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div className="empty-state" style={{ maxWidth: 480 }}>
        <BrandMark />
        <h3 style={{ marginTop: 18 }}>This website isn&apos;t available</h3>
        <p>The catering website you&apos;re looking for doesn&apos;t exist, or its owner hasn&apos;t published it yet.</p>
        <LinkButton href="/">Go to ServeSite</LinkButton>
      </div>
    </main>
  );
}
