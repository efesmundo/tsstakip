import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/AppShell";
import { ServiceDetail } from "@/components/services/ServiceDetail";
import { requireAdmin } from "@/lib/auth";

export default async function AdminServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [service, products, types, members, subcontractors, photos, photoRules] = await Promise.all([
    supabase.from("services").select("*").eq("id", id).single(),
    supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
    supabase.from("service_types").select("*").eq("is_active", true).order("name"),
    supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
    supabase.from("subcontractors").select("*").eq("is_active", true).order("name"),
    supabase.from("service_photos").select("*").eq("service_id", id).order("taken_at", { ascending: false }),
    supabase.from("photo_rules").select("gallery_upload_enabled").limit(1).maybeSingle(),
  ]);

  if (!service.data) notFound();

  return (
    <>
      <PageHeader subtitle="Servis bilgileri ve düzenleme" title="Servis Detayı" />
      <ServiceDetail
        galleryEnabled={photoRules.data?.gallery_upload_enabled ?? false}
        members={members.data ?? []}
        products={products.data ?? []}
        photos={photos.data ?? []}
        role="admin"
        service={service.data}
        serviceTypes={types.data ?? []}
        subcontractors={subcontractors.data ?? []}
      />
    </>
  );
}
