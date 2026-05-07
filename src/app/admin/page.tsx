import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/AppShell";
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

  const stats = [
    { label: "Bugün", value: todayServices.length, color: "text-accent" },
    { label: "Onay Bekliyor", value: awaiting.length, color: "text-amber-600" },
    { label: "Tamamlandı", value: completed.length, color: "text-emerald-600" },
    { label: "Acil", value: urgent.length, color: "text-red-700" },
  ];

  return (
    <>
      <PageHeader
        actions={
          <Link
            className="flex h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] hover:bg-accent-strong"
            href="/admin/services/new"
          >
            <Plus size={16} aria-hidden="true" />
            Yeni Servis
          </Link>
        }
        subtitle="Tüm servis kayıtları, üyeler ve sistem ayarları"
        title="Dashboard"
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <div
            className="rounded-xl bg-panel p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            key={label}
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-medium text-foreground/60">{label}</p>
            <p className={`mt-1.5 text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-5 space-y-4">
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={todayServices} title="Bugünün Servisleri" />
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={awaiting} title="Onay Bekleyen Servisler" />
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={urgent} title="Acil Servisler" />
      </section>
    </>
  );
}
