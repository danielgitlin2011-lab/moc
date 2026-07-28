import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/ui";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms under which ServeSite accounts and generated websites are provided.",
};

const UPDATED = "28 July 2026";

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="legal-nav container"><BrandMark /><Link href="/privacy">Privacy Policy</Link></header>
      <article className="container">
        <span className="eyebrow plain">Terms</span>
        <h1>Terms of Service</h1>
        <p className="legal-lede">
          These terms cover the use of ServeSite: the dashboard, the websites it generates, and the event requests
          it collects. By creating an account you accept them. Last updated {UPDATED}.
        </p>

        <section>
          <h2>The service</h2>
          <p>
            ServeSite lets a food business publish a website, manage its menu and gallery, and receive event
            requests. Some capabilities are still in development and are labelled &ldquo;coming soon&rdquo; in the
            interface; they are not part of what is being provided today.
          </p>
        </section>

        <section>
          <h2>Your account</h2>
          <ul>
            <li>You need an accurate email address, and you are responsible for what happens under your login.</li>
            <li>Use a password of at least eight characters that you do not use anywhere else.</li>
            <li>Tell us promptly if you believe someone else has access to your account.</li>
            <li>One account represents one business. Sharing a login across organisations is not permitted.</li>
          </ul>
        </section>

        <section>
          <h2>Your content</h2>
          <p>
            Everything you publish — text, photographs, logo, menus, prices — stays yours. You grant us only the
            permission needed to host and serve it: storing it, resizing images, and displaying the site to
            visitors. You confirm you have the right to publish what you upload, including photographs of events
            and people.
          </p>
        </section>

        <section>
          <h2>What you may not publish</h2>
          <ul>
            <li>Content you do not have the rights to, including other businesses&apos; photography.</li>
            <li>Anything unlawful, deceptive, or presented as another business.</li>
            <li>Testimonials or ratings that were not given by real clients.</li>
            <li>Anything designed to compromise visitors, such as scripts or misleading links.</li>
          </ul>
          <p>We may suspend a site that breaches this, and will tell you why.</p>
        </section>

        <section>
          <h2>Event requests</h2>
          <p>
            Requests submitted through your site are your data, and you are the one responsible for handling them
            lawfully — responding, storing, and deleting them as the people who sent them expect. We process them
            on your behalf under the <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>Availability</h2>
          <p>
            We work to keep the service available but do not guarantee uninterrupted operation. Maintenance,
            provider outages, and faults happen. We do not warrant that the service will meet every requirement of
            your business.
          </p>
        </section>

        <section>
          <h2>Fees and trials</h2>
          <p>
            Paid plans are billed monthly in advance, and a trial converts only if you choose to continue. You can
            cancel at any time and keep access until the end of the period already paid for. Prices change only
            with notice.
          </p>
        </section>

        <section>
          <h2>Ending the agreement</h2>
          <p>
            You can close your account at any time; see the <Link href="/privacy">Privacy Policy</Link> for what
            deletion covers and how to request it. We may end an account that breaches these terms, and will give
            reasonable notice unless doing so would cause harm.
          </p>
        </section>

        <section>
          <h2>Liability</h2>
          <p>
            To the extent the law allows, ServeSite is not liable for indirect or consequential loss, including
            lost bookings or lost revenue. Nothing here limits liability that cannot lawfully be limited.
          </p>
        </section>

        <section>
          <h2>Changes and contact</h2>
          <p>
            We will post material changes here with a new date, and notify account holders by email. Questions:{" "}
            <a href="mailto:support@servesite.example">support@servesite.example</a>.
          </p>
        </section>
      </article>
      <footer className="legal-footer container">
        <p>© {new Date().getFullYear()} ServeSite</p>
        <div><Link href="/">Home</Link><Link href="/privacy">Privacy Policy</Link></div>
      </footer>
    </main>
  );
}
