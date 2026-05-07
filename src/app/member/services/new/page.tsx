import { createServiceAction } from "@/app/actions";
import { AppShell, memberNav } from "@/components/layout/AppShell";
import { ServiceForm } from "@/components/services/ServiceForm";
import { requireProfile } from "@/lib/auth";

export default async function MemberNewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireProfile();
  const { error } = await searchParams;
  const [products, types, subcontractors] = await Promise.all([
    supabase.from("product_groups").select("*").eq("is_active", true).order("name"),
    supabase.from("service_types").select("*").eq("is_active", true).order("name"),
    supabase.from("subcontractors").select("*").eq("is_active", true).order("name"),
  ]);

  return (
    <AppShell nav={memberNav} subtitle="Yalnızca kendi adınıza servis kaydı açabilirsiniz" title="Yeni Servis Kaydı">
      {error ? (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {decodeURIComponent(error)}
        </div>
      ) : null}
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
