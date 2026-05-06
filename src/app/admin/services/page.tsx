import Link from "next/link";

import { AppShell, adminNav } from "@/components/layout/AppShell";
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

  return (
    <AppShell nav={adminNav} subtitle="Tüm eklenen kayıtlar" title="Servisler">
      <div className="mb-5 flex justify-end">
        <Link className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white" href="/admin/services/new">
          Yeni Servis
        </Link>
      </div>
      <div className="space-y-3">
        {(servicesResult.data ?? []).map((service) => (
          <ServiceCard href={`/admin/services/${service.id}`} key={service.id} lookup={lookup} service={service} />
        ))}
      </div>
    </AppShell>
  );
}
