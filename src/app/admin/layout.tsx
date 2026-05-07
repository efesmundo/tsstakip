import { AppHeader, adminNav } from "@/components/layout/AppShell";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationProgress />
      <AppHeader nav={adminNav} />
      <main className="mx-auto max-w-7xl px-5 py-6 md:px-8">{children}</main>
    </div>
  );
}
