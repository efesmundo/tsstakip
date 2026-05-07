import { redirect } from "next/navigation";

import { AppHeader, memberNav } from "@/components/layout/AppShell";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { requireProfile } from "@/lib/auth";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireProfile();
  if (profile.role === "admin") redirect("/admin");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationProgress />
      <AppHeader nav={memberNav} />
      <main className="mx-auto max-w-7xl px-5 py-6 md:px-8">{children}</main>
    </div>
  );
}
