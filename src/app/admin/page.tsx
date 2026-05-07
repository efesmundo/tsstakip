import { createServiceAction } from "@/app/actions";
import { PageHeader } from "@/components/layout/AppShell";
import { ServiceGroup } from "@/components/services/ServiceGroup";
import { ServiceCreateModal } from "@/components/services/ServiceCreateModal";
import { requireAdmin } from "@/lib/auth";
import { createLookup } from "@/lib/data";
import { inRange, resolvePeriod } from "@/lib/reports";

export default async function AdminPage() {
  const { supabase, profile } = await requireAdmin();
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
  const inProgress = services.filter((item) => item.status === "in_progress");
  const approved = services.filter((item) => item.status === "approved");

  const stats = [
    { label: "Bugün Açılan", value: todayServices.length },
    { label: "Onay Bekleyen", value: awaiting.length },
    { label: "Devam Eden", value: inProgress.length },
    { label: "Tamamlanan", value: completed.length },
  ];
  const statusRows = [
    { label: "Onaylandı", value: approved.length },
    { label: "Acil", value: urgent.length },
    { label: "Toplam Servis", value: services.length },
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
        title={`Merhaba, ${profile.full_name}`}
      />

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-border bg-panel p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Operasyon Özeti</h2>
              <p className="text-sm text-foreground/55">Bugünkü hareket ve açık iş yükü</p>
            </div>
            <span className="rounded-md bg-panel-muted px-2.5 py-1 text-xs font-semibold text-foreground/55">
              {new Date().toLocaleDateString("tr-TR")}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value }) => (
              <div className="rounded-lg border border-border bg-background p-3" key={label}>
                <p className="text-xs font-medium uppercase tracking-wide text-foreground/45">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-panel p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h2 className="font-semibold">İş Yükü</h2>
          <div className="mt-3 divide-y divide-border">
            {statusRows.map((row) => (
              <div className="flex items-center justify-between py-2.5 text-sm" key={row.label}>
                <span className="text-foreground/60">{row.label}</span>
                <span className="font-semibold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-3">
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={todayServices} title="Bugün Açılanlar" />
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={awaiting} title="Onay Bekleyenler" />
        <ServiceGroup baseHref="/admin/services" lookup={lookup} services={urgent} title="Acil Servisler" />
      </section>
    </>
  );
}
