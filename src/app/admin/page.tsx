import { createServiceAction } from "@/app/actions";
import { PageHeader } from "@/components/layout/AppShell";
import { ServiceGroup } from "@/components/services/ServiceGroup";
import { ServiceCreateModal } from "@/components/services/ServiceCreateModal";
import { requireAdmin } from "@/lib/auth";
import { createLookup } from "@/lib/data";
import { inRange, resolvePeriod } from "@/lib/reports";

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
  const { range: todayRange } = resolvePeriod("today");
  const todayServices = services.filter((item) => inRange(item.created_at, todayRange));
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
          <ServiceCreateModal
            action={createServiceAction}
            buttonLabel="Yeni Servis"
            members={membersResult.data ?? []}
            products={productsResult.data ?? []}
            role="admin"
            serviceTypes={typesResult.data ?? []}
            subcontractors={subcontractorsResult.data ?? []}
            title="Yeni Servis"
          />
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
