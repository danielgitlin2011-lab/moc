import { redirect } from "next/navigation";
import { AppProvider } from "@/components/app-provider";
import { getBusinessBundleForUser } from "@/lib/supabase/get-business-bundle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const bundle = await getBusinessBundleForUser();

  if (!bundle) redirect("/onboarding");

  return (
    <AppProvider initialState={bundle.state} businessId={bundle.businessId}>
      {children}
    </AppProvider>
  );
}
