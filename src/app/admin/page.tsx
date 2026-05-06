import Link from "next/link";

import { AppShell, adminNav } from "@/components/layout/AppShell";
import { ServiceGroup } from "@/components/services/ServiceGroup";
import { requireAdmin } from "@/lib/auth";
import { createLookup } from "@/lib/data";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [
    servicesResult,
    productsResult,
    typesResult,
    membersResult,
    subcontractorsResult,
  ] = await Promise.all([
    supabase.from("services").select("*").order("created_at", { ascending: false }),
    supabase.from("product_groups").select("*").order("name"),
    supabase.from("service_types").select("*").order("name"),
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("subcontractors").select("*").order("name"),
  ]);

  const services = servicesResult.data ?? [];
  const lookup = createLookup({
    products: productsResult.data,
    types: typesResult.data,
    members: membersResult.data,
    subcontractors: subcontractorsResult.data,
  });
  const today = new Date().toISOString().slice(0, 10);
  const todayServices = services.filter((item) => item.scheduled_at?.startsWith(today));
  const awaiting = services.filter((item) => item.status === "awaiting_approval");
  const completed = services.filter((item) => item.status === "completed");
  const urgent = services.filter((item) => item.priority === "urgent");

  return (
    <AppShell
      nav={adminNav}
      subtitle="Tüm servis kayıtları, üyeler ve sistem ayarları"
      title="Admin Dashboard"
    >
      <div className="mb-5 flex justify-end">
        <Link
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          href="/admin/services/new"
        >
          Yeni Servis
        </Link>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ["Bugün", todayServices.length],
          ["Onay Bekliyor", awaiting.length],
          ["Tamamlandı", completed.length],
          ["Acil", urgent.length],
        ].map(([label, value]) => (
          <div className="rounded-lg border border-border bg-panel p-4" key={label}>
            <p className="text-sm text-foreground/70">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 space-y-4">
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={todayServices} title="Bugünün Servisleri" />
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={awaiting} title="Onay Bekleyen Servisler" />
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={completed} title="Tamamlananlar" />
      </section>
    </AppShell>
  );
}
