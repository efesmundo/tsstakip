import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell, memberNav } from "@/components/layout/AppShell";
import { ServiceGroup } from "@/components/services/ServiceGroup";
import { requireProfile } from "@/lib/auth";
import { createLookup } from "@/lib/data";

export default async function MemberPage() {
  const { supabase, user, profile } = await requireProfile();
  if (profile.role === "admin") {
    redirect("/admin");
  }

  const [servicesResult, productsResult, typesResult, membersResult] =
    await Promise.all([
      supabase
        .from("services")
        .select("*")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("product_groups").select("*").order("name"),
      supabase.from("service_types").select("*").order("name"),
      supabase.from("profiles").select("*").eq("id", user.id),
    ]);

  const services = servicesResult.data ?? [];
  const lookup = createLookup({
    products: productsResult.data,
    types: typesResult.data,
    members: membersResult.data,
  });
  const active = services.filter((item) => item.status !== "completed");
  const completed = services.filter((item) => item.status === "completed");

  return (
    <AppShell
      nav={memberNav}
      subtitle="Kendi servis taleplerinizi oluşturun ve takip edin"
      title="Üye Paneli"
    >
      <div className="mb-5 flex justify-end">
        <Link
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong"
          href="/member/services/new"
        >
          Yeni Servis Kaydı
        </Link>
      </div>
      <section className="space-y-4">
        <ServiceGroup baseHref="/member/services" lookup={lookup} services={active} title="Aktif Servislerim" />
        <ServiceGroup baseHref="/member/services" lookup={lookup} services={completed} title="Tamamlananlar" />
      </section>
    </AppShell>
  );
}
