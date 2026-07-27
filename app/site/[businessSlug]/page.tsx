import type { Metadata } from "next";
import { PublicWebsite } from "@/components/public-website";

export const metadata: Metadata = {
  title: "Olive & Ember Catering",
  description: "Elegant kosher catering for unforgettable gatherings in Miami.",
};

export default function CateringSitePage() {
  return <PublicWebsite />;
}
