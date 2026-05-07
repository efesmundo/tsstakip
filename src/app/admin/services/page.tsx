import { createServiceAction } from "@/app/actions";
import { PageHeader } from "@/components/layout/AppShell";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceCreateModal } from "@/components/services/ServiceCreateModal";
import { requireAdmin } from "@/lib/auth";
import { createLookup } from "@/lib/data";

export default async function AdminServicesPage() {
  const { supabase } = await requireAdmin();
  const [servicesResult, productsResult, typesResult, membersResult, subcontractorsResult] =
    await Promise.all([
      supabase.from("services").select("*").order("created_at", { ascending: false }),
      supabase.from("product_groups").select("*").order("name"),
      supabase.from("service_types").select("*").order("name"),
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("subcontractors").select("*").order("name"),
    ]);
  const lookup = createLookup({
    products: productsResult.data,
    types: typesResult.data,
    members: membersResult.data,
    subcontractors: subcontractorsResult.data,
  });
  const services = servicesResult.data ?? [];

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
        subtitle={`${services.length} servis kaydı`}
        title="Servisler"
      />
      <div className="space-y-2.5">
        {services.length === 0 ? (
          <p className="rounded-xl bg-panel p-8 text-center text-sm text-foreground/50" style={{ boxShadow: "var(--shadow-sm)" }}>
            Henüz servis kaydı yok.
          </p>
        ) : (
          services.map((service) => (
            <ServiceCard href={`/admin/services/${service.id}`} key={service.id} lookup={lookup} service={service} />
          ))
        )}
      </div>
    </>
  );
}
