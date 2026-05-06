"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-panel px-3 text-sm font-medium transition hover:bg-panel-muted disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isSigningOut}
      onClick={handleSignOut}
      type="button"
    >
      <LogOut size={16} aria-hidden="true" />
      {isSigningOut ? "Çıkılıyor..." : "Çıkış Yap"}
    </button>
  );
}
