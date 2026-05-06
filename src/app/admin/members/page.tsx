import {
  createMemberAction,
  deleteMemberAction,
  updateMemberAction,
} from "@/app/actions";
import { AppShell, adminNav } from "@/components/layout/AppShell";
import { requireAdmin } from "@/lib/auth";

export default async function MembersPage() {
  const { supabase } = await requireAdmin();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  return (
    <AppShell nav={adminNav} subtitle="Admin üyeleri ekler, rollerini değiştirir ve pasife alır" title="Üyeler">
      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form action={createMemberAction} className="rounded-lg border border-border bg-panel p-4">
          <h2 className="text-lg font-semibold">Yeni Üye</h2>
          <div className="mt-4 space-y-3">
            <Input label="Ad Soyad" name="full_name" required />
            <Input label="E-posta" name="email" required type="email" />
            <Input label="Şifre" name="password" required type="password" />
            <Input label="Telefon" name="phone" />
            <Select label="Rol" name="role">
              <option value="member">Üye</option>
              <option value="admin">Admin</option>
            </Select>
            <button className="h-11 w-full rounded-md bg-accent px-4 text-sm font-semibold text-white">
              Üye Ekle
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {(members ?? []).map((member) => (
            <form
              action={updateMemberAction}
              className="rounded-lg border border-border bg-panel p-4"
              key={member.id}
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
                  <input defaultChecked={member.is_active} name="is_active" type="checkbox" />
                  Aktif
                </label>
                <div className="flex gap-2">
                  <button className="h-11 rounded-md border border-border px-3 text-sm font-medium">
                    Kaydet
                  </button>
                  <button
                    className="h-11 rounded-md border border-danger/30 bg-danger/10 px-3 text-sm font-medium text-danger"
                    formAction={deleteMemberAction}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </form>
          ))}
        </div>
      </section>
    </AppShell>
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
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none"
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
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none"
        defaultValue={value}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}
