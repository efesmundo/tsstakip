import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/AppShell";
import { ServiceCard } from "@/components/services/ServiceCard";
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
          <Link
            className="flex h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] hover:bg-accent-strong"
            href="/admin/services/new"
          >
            <Plus size={16} aria-hidden="true" />
            Yeni Servis
          </Link>
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
