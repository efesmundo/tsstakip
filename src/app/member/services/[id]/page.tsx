import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/AppShell";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { requireProfile } from "@/lib/auth";

export default async function MemberServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user, profile } = await requireProfile();

  const [service, products, types, subcontractors, photos] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).eq("member_id", user.id).single(),
    supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
    supabase.from("service_types").select("*").eq("is_active", true).order("name"),
    supabase.from("subcontractors").select("*").eq("is_active", true).order("name"),
    supabase.from("service_photos").select("*").eq("service_id", id).order("taken_at", { ascending: false }),
  ]);

  if (!service.data) notFound();

  return (
    <>
      <PageHeader subtitle="Servis kaydı detayları" title="Servis Detayı" />
      <ServiceDetail
        members={[profile]}
        products={products.data ?? []}
        photos={photos.data ?? []}
        role="member"
        service={service.data}
        serviceTypes={types.data ?? []}
        subcontractors={subcontractors.data ?? []}
      />
    </>
  );
}
