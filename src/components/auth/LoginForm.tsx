"use client";

import { LockKeyhole, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type LoginState = "idle" | "loading";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Oturum acilamadi. Lutfen tekrar deneyin.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,is_active")
        .eq("id", userId)
        .single();

      if (profileError) {
        setError(`Profil okunamadi: ${profileError.message}`);
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setError("Bu kullanici pasif durumda. Lutfen admin ile iletisime gecin.");
        return;
      }

      router.replace(profile.role === "admin" ? "/admin" : "/member");
      router.refresh();
    } finally {
      setStatus("idle");
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">E-posta</span>
        <div className="flex h-12 items-center gap-3 rounded-md border border-border bg-background px-3">
          <UserRound size={18} aria-hidden="true" />
          <input
            autoComplete="email"
            className="h-full w-full bg-transparent text-sm outline-none"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="mete@apsiyon.com"
            required
            type="email"
            value={email}
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">Şifre</span>
        <div className="flex h-12 items-center gap-3 rounded-md border border-border bg-background px-3">
          <LockKeyhole size={18} aria-hidden="true" />
          <input
            autoComplete="current-password"
            className="h-full w-full bg-transparent text-sm outline-none"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
            type="password"
            value={password}
          />
        </div>
      </label>

      {error ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <button
        className="h-12 w-full rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
        disabled={status === "loading"}
        type="submit"
      >
        {status === "loading" ? "Giris yapiliyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
