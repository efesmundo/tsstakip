import { createServiceAction } from "@/app/actions";
import { AppShell, memberNav } from "@/components/layout/AppShell";
import { ServiceForm } from "@/components/services/ServiceForm";
import { requireProfile } from "@/lib/auth";

export default async function MemberNewServicePage() {
  const { supabase } = await requireProfile();
  const [products, types, subcontractors] = await Promise.all([
    supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
    supabase.from("service_types").select("*").eq("is_active", true).order("name"),
    supabase.from("subcontractors").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <AppShell nav={memberNav} subtitle="Yalnızca kendi adınıza servis kaydı açabilirsiniz" title="Yeni Servis Kaydı">
      <ServiceForm
        action={createServiceAction}
        members={[]}
        mode="create"
        products={products.data ?? []}
        role="member"
        serviceTypes={types.data ?? []}
        subcontractors={subcontractors.data ?? []}
      />
    </AppShell>
  );
}
