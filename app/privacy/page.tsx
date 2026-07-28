import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What ServeSite collects, why, how long it is kept, and how to have it deleted.",
};

const UPDATED = "28 July 2026";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-nav container"><BrandMark /><Link href="/terms">Terms of Service</Link></header>
      <article className="container">
        <span className="eyebrow plain">Privacy</span>
        <h1>Privacy Policy</h1>
        <p className="legal-lede">
          ServeSite is a website builder and lead inbox for catering businesses. This page describes what we
          collect, why, how long we keep it, and how to have it removed. Last updated {UPDATED}.
        </p>

        <section>
          <h2>Two kinds of people, two kinds of data</h2>
          <p>
            <strong>Caterers</strong> hold an account with us. <strong>Their clients</strong> never sign up — they
            visit a catering site and may send an event request. Those are different relationships, and we treat
            the data differently.
          </p>
        </section>

        <section>
          <h2>What we collect from account holders</h2>
          <ul>
            <li><strong>Account:</strong> email address and a hashed password, handled by our authentication provider. We never see or store the password itself.</li>
            <li><strong>Business content:</strong> everything typed into the dashboard — business details, menus, photographs, service areas, policies, and site copy. This is published on the catering website the account creates.</li>
            <li><strong>Usage counters:</strong> a daily total of views for each published site. No visitor profiles, no cross-site tracking, no advertising identifiers.</li>
          </ul>
        </section>

        <section>
          <h2>What we collect from site visitors</h2>
          <p>
            When someone submits an event request, the form collects what the caterer needs to quote the job:
            name, email, phone, event date, location, type, guest count, budget range, dietary requirements, and
            whatever notes they choose to add. We also record how the visitor arrived — a UTM tag or referring
            page — so the caterer can see which channels work.
          </p>
          <p>
            This information belongs to the caterer. We process it on their behalf so they can respond. We do not
            sell it, share it between accounts, or use it to market anything.
          </p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>
            Only what the product needs to function: a session cookie that keeps an account holder logged in, and
            a short-lived browser flag that stops one visitor being counted repeatedly in a single session. There
            are no analytics or advertising cookies.
          </p>
        </section>

        <section>
          <h2>Who else touches the data</h2>
          <ul>
            <li><strong>Supabase</strong> — database, authentication, and email delivery for account mail.</li>
            <li><strong>Vercel</strong> — application hosting and image storage.</li>
          </ul>
          <p>These providers process data under contract, for us, and for no other purpose.</p>
        </section>

        <section>
          <h2>How long it is kept</h2>
          <ul>
            <li><strong>Account and business content:</strong> for as long as the account is open.</li>
            <li><strong>Event requests:</strong> kept until the caterer deletes them, or the account is closed.</li>
            <li><strong>View counters:</strong> a rolling record per site, aggregated by day. It contains no personal data.</li>
          </ul>
        </section>

        <section>
          <h2>Your rights, and how to use them</h2>
          <p>
            You can ask for a copy of your data, correction of anything inaccurate, or deletion of your account and
            everything in it. Email <a href="mailto:privacy@servesite.example">privacy@servesite.example</a> from
            the address on the account. We respond within 30 days.
          </p>
          <p>
            Deletion removes the account, the business, its website, menus, gallery, and every event request stored
            against it, and the site stops being served. Backups age out on their own schedule within 30 days.
          </p>
          <p>
            If you sent an event request to a caterer and want it removed, contact that caterer — the data is
            theirs. If they cannot help, write to us and we will pass it on.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy: <a href="mailto:privacy@servesite.example">privacy@servesite.example</a>.
          </p>
        </section>
      </article>
      <footer className="legal-footer container">
        <p>© {new Date().getFullYear()} ServeSite</p>
        <div><Link href="/">Home</Link><Link href="/terms">Terms of Service</Link></div>
      </footer>
    </main>
  );
}
