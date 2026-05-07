import { UserPlus } from "lucide-react";

import {
  createMemberAction,
  deleteMemberAction,
  updateMemberAction,
} from "@/app/actions";
import { PageHeader } from "@/components/layout/AppShell";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireAdmin } from "@/lib/auth";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { error, ok } = await searchParams;
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  return (
    <>
      <PageHeader subtitle="Admin üyeleri ekler, rollerini değiştirir ve pasife alır" title="Üyeler" />
      {error ? (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          <strong>Hata:</strong> {decodeURIComponent(error)}
        </div>
      ) : null}
      {ok ? (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Üye başarıyla eklendi.
        </div>
      ) : null}
      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form
          action={createMemberAction}
          className="h-fit rounded-xl bg-panel p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent text-white">
              <UserPlus size={16} aria-hidden="true" />
            </div>
            <h2 className="font-semibold">Yeni Üye</h2>
          </div>
          <div className="space-y-3">
            <Input label="Ad Soyad" name="full_name" required />
            <Input label="E-posta" name="email" required type="email" />
            <Input label="Şifre" name="password" required type="password" />
            <Input label="Telefon" name="phone" />
            <Select label="Rol" name="role">
              <option value="member">Üye</option>
              <option value="admin">Admin</option>
            </Select>
            <SubmitButton
              className="h-11 w-full rounded-lg bg-accent text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] hover:bg-accent-strong disabled:opacity-60"
              label="Üye Ekle"
              pendingLabel="Ekleniyor..."
            />
          </div>
        </form>

        <div className="space-y-2.5">
          {(members ?? []).length === 0 ? (
            <p className="rounded-xl bg-panel p-8 text-center text-sm text-foreground/50" style={{ boxShadow: "var(--shadow-sm)" }}>
              Henüz üye yok.
            </p>
          ) : (
            (members ?? []).map((member) => (
              <form
                action={updateMemberAction}
                className="rounded-xl bg-panel p-4 transition hover:shadow-md"
                key={member.id}
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <input name="id" type="hidden" value={member.id} />
                <div className="grid gap-3 md:grid-cols-[1fr_160px_120px_80px_auto] md:items-end">
                  <Input label="Ad Soyad" name="full_name" value={member.full_name} />
                  <Input label="Telefon" name="phone" value={member.phone ?? ""} />
                  <Select label="Rol" name="role" value={member.role}>
                    <option value="member">Üye</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <label className="flex h-11 items-center gap-2 text-sm">
                    <input className="h-4 w-4 accent-accent" defaultChecked={member.is_active} name="is_active" type="checkbox" />
                    Aktif
                  </label>
                  <div className="flex gap-2">
                    <button className="h-11 rounded-lg border border-border px-3 text-sm font-medium transition active:scale-95 hover:border-accent/40 hover:text-accent">
                      Kaydet
                    </button>
                    <button
                      className="h-11 rounded-lg border border-danger/30 bg-danger/8 px-3 text-sm font-medium text-danger transition active:scale-95 hover:bg-danger/15"
                      formAction={deleteMemberAction}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </form>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function Input({
  label,
  name,
  required,
  type = "text",
  value,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground/75">{label}</span>
      <input
        className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        defaultValue={value}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function Select({
  children,
  label,
  name,
  value,
}: {
  children: React.ReactNode;
  label: string;
  name: string;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground/75">{label}</span>
      <select
        className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        defaultValue={value}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}
