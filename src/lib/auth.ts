import { redirect } from "next/navigation";
import { cache } from "react";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const getSessionProfile = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile };
});

export async function requireProfile() {
  const session = await getSessionProfile();

  if (!session.user || !session.profile?.is_active) {
    redirect("/");
  }

  return {
    supabase: session.supabase,
    user: session.user,
    profile: session.profile,
  };
}

export async function requireAdmin() {
  const session = await requireProfile();

  if (session.profile.role !== "admin") {
    redirect("/member");
  }

  return session;
}
