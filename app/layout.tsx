import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { requestOrigin } from "@/lib/seo";
import { themeBootstrap } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#161713" },
  ],
  colorScheme: "light dark",
};

export async function generateMetadata(): Promise<Metadata> {
  const origin = new URL(await requestOrigin());
  const title = "ServeSite — Websites built for food businesses";
  const description = "Launch a polished website for your food business, manage menus, and turn inquiries into booked business.";
  const socialImage = new URL("/og.png", origin).toString();
  return {
    metadataBase: origin,
    title: { default: title, template: "%s | ServeSite" },
    description,
    applicationName: "ServeSite",
    keywords: ["food business website builder", "restaurant website", "caterer website", "private chef website", "food business CRM", "event quote form"],
    alternates: { canonical: origin.toString() },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "ServeSite", statusBarStyle: "default" },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title, description, type: "website", url: origin.toString(), siteName: "ServeSite", images: [{ url: socialImage, width: 1728, height: 909, alt: "ServeSite food business website builder" }] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Paints the saved colour theme before first render so switching
            between light and dark never flashes the wrong one. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
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
