import {
  createProductGroupAction,
  createServiceTypeAction,
  createSubcontractorAction,
  togglePriorityAction,
  updatePhotoRulesAction,
} from "@/app/actions";
import { AppShell, adminNav } from "@/components/layout/AppShell";
import { requireAdmin } from "@/lib/auth";
import { priorityLabels } from "@/lib/labels";

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const [products, types, priorities, subcontractors, photoRules] =
    await Promise.all([
      supabase.from("product_groups").select("*").order("name"),
      supabase.from("service_types").select("*").order("name"),
      supabase.from("priority_settings").select("*").order("sort_order"),
      supabase.from("subcontractors").select("*").order("name"),
      supabase.from("photo_rules").select("*").limit(1).single(),
    ]);

  return (
    <AppShell nav={adminNav} subtitle="Ürün, servis tipi, öncelik, taşeron ve fotoğraf kuralları" title="Ayarlar">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Ürün Grupları">
          <CreateLine action={createProductGroupAction} placeholder="Ürün grubu adı" />
          <List items={(products.data ?? []).map((item) => `${item.name} ${item.is_active ? "" : "(pasif)"}`)} />
        </Panel>

        <Panel title="Servis Tipleri">
          <form action={createServiceTypeAction} className="flex gap-2">
            <input className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm" name="name" placeholder="Servis tipi adı" required />
            <select className="h-11 rounded-md border border-border bg-background px-3 text-sm" name="product_group_id">
              <option value="">Ürün yok</option>
              {(products.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button className="rounded-md bg-accent px-4 text-sm font-semibold text-white">Ekle</button>
          </form>
          <List items={(types.data ?? []).map((item) => item.name)} />
        </Panel>

        <Panel title="Öncelikler">
          <div className="space-y-2">
            {(priorities.data ?? []).map((item) => (
              <form action={togglePriorityAction} className="flex items-center justify-between rounded-md bg-background px-3 py-2" key={item.priority}>
                <input name="priority" type="hidden" value={item.priority} />
                <span className="text-sm font-medium">{priorityLabels[item.priority]}</span>
                <label className="flex items-center gap-2 text-sm">
                  <input defaultChecked={item.is_active} name="is_active" type="checkbox" />
                  Aktif
                </label>
                <button className="rounded-md border border-border px-3 py-1 text-sm">Kaydet</button>
              </form>
            ))}
          </div>
        </Panel>

        <Panel title="Taşeron Firmalar">
          <form action={createSubcontractorAction} className="grid gap-2 md:grid-cols-3">
            <input className="h-11 rounded-md border border-border bg-background px-3 text-sm" name="name" placeholder="Firma" required />
            <input className="h-11 rounded-md border border-border bg-background px-3 text-sm" name="contact_name" placeholder="Sorumlu" />
            <input className="h-11 rounded-md border border-border bg-background px-3 text-sm" name="phone" placeholder="Telefon" />
            <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white md:col-span-3">Ekle</button>
          </form>
          <List items={(subcontractors.data ?? []).map((item) => `${item.name} · ${item.contact_name ?? "-"}`)} />
        </Panel>

        <Panel title="Fotoğraf Kuralları">
          <form action={updatePhotoRulesAction} className="space-y-3">
            {[
              ["require_start_photo", "Başlangıç fotoğrafı zorunlu"],
              ["require_end_photo", "Bitiş fotoğrafı zorunlu"],
              ["camera_only", "Yalnızca kameradan çekim"],
              ["gallery_upload_enabled", "Galeriden yükleme"],
            ].map(([name, label]) => (
              <label className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm" key={name}>
                <span>{label}</span>
                <input
                  defaultChecked={Boolean(photoRules.data?.[name as keyof typeof photoRules.data])}
                  name={name}
                  type="checkbox"
                />
              </label>
            ))}
            <button className="h-11 rounded-md bg-accent px-4 text-sm font-semibold text-white">
              Kuralları Kaydet
            </button>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-border bg-panel p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function CreateLine({
  action,
  placeholder,
}: {
  action: (formData: FormData) => void | Promise<void>;
  placeholder: string;
}) {
  return (
    <form action={action} className="flex gap-2">
      <input className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm" name="name" placeholder={placeholder} required />
      <button className="rounded-md bg-accent px-4 text-sm font-semibold text-white">Ekle</button>
    </form>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {items.length ? items.map((item) => <li className="rounded-md bg-background px-3 py-2" key={item}>{item}</li>) : <li className="rounded-md bg-background px-3 py-2 text-foreground/60">Henüz kayıt yok.</li>}
    </ul>
  );
}
