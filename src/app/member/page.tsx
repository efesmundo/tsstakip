import { redirect } from "next/navigation";

import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function MemberPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", user.id)
    .single();

  if (!profile?.is_active) {
    redirect("/");
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return (
    <RoleDashboard
      description="Uye panelinde servis kaydi acma akisini kuracagiz. Uyeler yalnizca kendi servis taleplerini gorup yeni kayit olusturabilecek."
      highlights={[
        { label: "Servis kaydi", value: "Acabilir" },
        { label: "Kayit erisimi", value: "Kendi" },
        { label: "Yetki", value: "Sinirli" },
      ]}
      roleLabel="Üye"
      title="Üye Dashboard"
    />
  );
}
