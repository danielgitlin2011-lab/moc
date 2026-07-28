import type { MetadataRoute } from "next";

/**
 * Food business owners live on their phones between events, so the dashboard is worth
 * installing. `start_url` points at the workspace rather than the marketing
 * page — an installed icon should open the tool, not the pitch.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ServeSite — food business websites and leads",
    short_name: "ServeSite",
    description: "Publish a website for your food business, manage your menu, and turn inquiries into booked business.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fbfaf6",
    theme_color: "#2e4b3f",
    categories: ["business", "food", "productivity"],
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Leads", short_name: "Leads", url: "/dashboard/leads", description: "Follow up on event inquiries" },
      { name: "Menu", short_name: "Menu", url: "/dashboard/menu", description: "Edit your dishes and packages" },
      { name: "Preview site", short_name: "Preview", url: "/preview", description: "See your published website" },
    ],
  };
}
