import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose a new password",
  // A reset link must never be followed by a crawler, and never indexed.
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
