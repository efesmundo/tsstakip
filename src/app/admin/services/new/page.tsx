import { createServiceAction } from "@/app/actions";
import { AppShell, adminNav } from "@/components/layout/AppShell";
import { ServiceForm } from "@/components/services/ServiceForm";
import { requireAdmin } from "@/lib/auth";

export default async function AdminNewServicePage() {
  const { supabase } = await requireAdmin();
  const [products, types, members, subcontractors] = await Promise.all([
    supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
    supabase.from("service_types").select("*").eq("is_active", true).order("name"),
    supabase.from("profiles").select("*").eq("is_active", true).order("full_name"),
    supabase.from("subcontractors").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <AppShell nav={adminNav} subtitle="4 adımlı servis kayıt formu" title="Yeni Servis">
      <ServiceForm
        action={createServiceAction}
        members={members.data ?? []}
        mode="create"
        products={products.data ?? []}
        role="admin"
        serviceTypes={types.data ?? []}
        subcontractors={subcontractors.data ?? []}
      />
    </AppShell>
  );
}
