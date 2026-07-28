import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { requestOrigin } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#233a31" },
  ],
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  const origin = new URL(await requestOrigin());
  const title = "ServeSite — Websites built for caterers";
  const description = "Launch a polished catering website, manage menus, and turn event inquiries into booked business.";
  const socialImage = new URL("/og.png", origin).toString();
  return {
    metadataBase: origin,
    title: { default: title, template: "%s | ServeSite" },
    description,
    applicationName: "ServeSite",
    keywords: ["catering website builder", "caterer website", "private chef website", "catering CRM", "event quote form"],
    alternates: { canonical: origin.toString() },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title, description, type: "website", url: origin.toString(), siteName: "ServeSite", images: [{ url: socialImage, width: 1728, height: 909, alt: "ServeSite catering website builder" }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Customer photography is served from these hosts on nearly every page. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
