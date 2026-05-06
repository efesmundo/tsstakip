import { notFound, redirect } from "next/navigation";

import { AppShell, memberNav } from "@/components/layout/AppShell";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { requireProfile } from "@/lib/auth";

export default async function MemberServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user, profile } = await requireProfile();
  if (profile.role === "admin") redirect(`/admin/services/${id}`);

  const [service, products, types, members, subcontractors, photos] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).eq("member_id", user.id).single(),
    supabase.from("product_groups").select("*").order("name"),
    supabase.from("service_types").select("*").order("name"),
    supabase.from("profiles").select("*").eq("id", user.id),
    supabase.from("subcontractors").select("*").order("name"),
    supabase.from("service_photos").select("*").eq("service_id", id).order("taken_at", { ascending: false }),
  ]);

  if (!service.data) notFound();

  return (
    <AppShell nav={memberNav} subtitle="Servis kaydı detayları" title="Servis Detayı">
      <ServiceDetail
        members={members.data ?? []}
        products={products.data ?? []}
        photos={photos.data ?? []}
        role="member"
        service={service.data}
        serviceTypes={types.data ?? []}
        subcontractors={subcontractors.data ?? []}
      />
    </AppShell>
  );
}
