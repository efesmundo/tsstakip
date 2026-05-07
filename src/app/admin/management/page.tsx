import Link from "next/link";
import { KeyRound, Settings } from "lucide-react";

import { MemberManagementPanel } from "@/components/admin/MemberManagementPanel";
import { PageHeader } from "@/components/layout/AppShell";
import { requireAdmin } from "@/lib/auth";

export default async function ManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error, ok } = await searchParams;
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  return (
    <>
      <PageHeader
        subtitle="Üye yönetimi, API erişimi ve sistem araçları"
        title="Yönetim Paneli"
      />

      <section className="mb-5 grid gap-3 md:grid-cols-2">
        <Link
          className="rounded-xl border border-border bg-panel p-4 transition hover:border-accent/35 hover:shadow-md"
          href="/api/v1/info"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-surface text-accent">
              <KeyRound size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold">API Bilgisi ve Tokenlar</h2>
              <p className="mt-1 text-sm text-foreground/60">
                Servis durum API dokümanı, bearer token üretme ve token silme.
              </p>
            </div>
          </div>
        </Link>
        <Link
          className="rounded-xl border border-border bg-panel p-4 transition hover:border-accent/35 hover:shadow-md"
          href="/admin/settings"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-panel-muted text-foreground/70">
              <Settings size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold">Sistem Ayarları</h2>
              <p className="mt-1 text-sm text-foreground/60">
                Ürün grupları, servis tipleri, taşeronlar ve fotoğraf kuralları.
              </p>
            </div>
          </div>
        </Link>
      </section>

      <MemberManagementPanel
        error={error}
        members={members ?? []}
        ok={ok}
        returnTo="/admin/management"
      />
    </>
  );
}
