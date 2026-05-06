import { redirect } from "next/navigation";

import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminPage() {
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

  if (profile.role !== "admin") {
    redirect("/member");
  }

  return (
    <RoleDashboard
      description="Admin panelinden uyeleri yonetecek, servis kayitlarini duzenleyecek ve tum operasyon akisini takip edecegiz."
      highlights={[
        { label: "Uye yonetimi", value: "Hazir" },
        { label: "Tum kayitlar", value: "Admin" },
        { label: "Yetki", value: "Tam erisim" },
      ]}
      roleLabel="Admin"
      title="Admin Dashboard"
    />
  );
}
