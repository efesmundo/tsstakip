import { notFound } from "next/navigation";

import { AppShell, adminNav } from "@/components/layout/AppShell";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { requireAdmin } from "@/lib/auth";

export default async function AdminServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [service, products, types, members, subcontractors, photos] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).single(),
    supabase.from("product_groups").select("*").order("name"),
    supabase.from("service_types").select("*").order("name"),
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("subcontractors").select("*").order("name"),
    supabase.from("service_photos").select("*").eq("service_id", id).order("taken_at", { ascending: false }),
  ]);

  if (!service.data) notFound();

  return (
    <AppShell nav={adminNav} subtitle="Servis bilgileri ve düzenleme" title="Servis Detayı">
      <ServiceDetail
        members={members.data ?? []}
        products={products.data ?? []}
        photos={photos.data ?? []}
        role="admin"
        service={service.data}
        serviceTypes={types.data ?? []}
        subcontractors={subcontractors.data ?? []}
      />
    </AppShell>
  );
}
