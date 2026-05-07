import { Plus, Trash2 } from "lucide-react";

import {
  createProductGroupAction,
  createServiceTypeAction,
  createSubcontractorAction,
  deleteProductGroupAction,
  deleteServiceTypeAction,
  deleteSubcontractorAction,
  togglePriorityAction,
  updatePhotoRulesAction,
  updateProductGroupAction,
  updateServiceTypeAction,
  updateSubcontractorAction,
} from "@/app/actions";
import { PageHeader } from "@/components/layout/AppShell";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import { priorityLabels } from "@/lib/labels";
import type { ProductGroup, ServiceType, Subcontractor } from "@/lib/data";

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
    <>
      <PageHeader subtitle="Ürün, servis tipi, öncelik, taşeron ve fotoğraf kuralları" title="Ayarlar" />
      <div className="grid gap-5 lg:grid-cols-2">

        {/* Ürün Grupları */}
        <Panel title="Ürün Grupları">
          <AddForm action={createProductGroupAction} placeholder="Yeni ürün grubu adı" />
          <div className="mt-4 space-y-2">
            {(products.data ?? []).length === 0 ? (
              <Empty />
            ) : (
              (products.data ?? []).map((item) => (
                <ProductGroupRow key={item.id} item={item} />
              ))
            )}
          </div>
        </Panel>

        {/* Servis Tipleri */}
        <Panel title="Servis Tipleri">
          <form action={createServiceTypeAction} className="space-y-2">
            <div className="flex gap-2">
              <input
                className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                name="name"
                placeholder="Yeni servis tipi adı"
                required
              />
              <select
                className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
                name="product_group_id"
              >
                <option value="">Ürün grubu yok</option>
                {(products.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <SubmitButton
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-strong"
                pendingLabel={null}
              >
                <Plus size={18} aria-hidden="true" />
              </SubmitButton>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {(types.data ?? []).length === 0 ? (
              <Empty />
            ) : (
              (types.data ?? []).map((item) => (
                <ServiceTypeRow key={item.id} item={item} products={products.data ?? []} />
              ))
            )}
          </div>
        </Panel>

        {/* Öncelikler */}
        <Panel title="Öncelikler">
          <div className="space-y-2">
            {(priorities.data ?? []).map((item) => (
              <form
                action={togglePriorityAction}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                key={item.priority}
              >
                <input name="priority" type="hidden" value={item.priority} />
                <span className="text-sm font-medium">{priorityLabels[item.priority]}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-foreground/70">
                    <input
                      className="h-4 w-4 accent-accent"
                      defaultChecked={item.is_active}
                      name="is_active"
                      type="checkbox"
                    />
                    Aktif
                  </label>
                  <SubmitButton
                    className="h-8 rounded-md border border-border bg-panel px-3 text-xs font-medium hover:border-accent/40 hover:text-accent disabled:opacity-50"
                    label="Kaydet"
                    pendingLabel="..."
                  />
                </div>
              </form>
            ))}
          </div>
        </Panel>

        {/* Taşeron Firmalar */}
        <Panel title="Taşeron Firmalar">
          <form action={createSubcontractorAction} className="grid grid-cols-3 gap-2">
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              name="name"
              placeholder="Firma adı"
              required
            />
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              name="contact_name"
              placeholder="Sorumlu kişi"
            />
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              name="phone"
              placeholder="Telefon"
            />
            <SubmitButton
              className="col-span-3 flex h-10 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-white hover:bg-accent-strong"
              pendingLabel="Ekleniyor..."
            >
              <Plus size={16} aria-hidden="true" />
              Taşeron Ekle
            </SubmitButton>
          </form>
          <div className="mt-4 space-y-2">
            {(subcontractors.data ?? []).length === 0 ? (
              <Empty />
            ) : (
              (subcontractors.data ?? []).map((item) => (
                <SubcontractorRow key={item.id} item={item} />
              ))
            )}
          </div>
        </Panel>

        {/* Fotoğraf Kuralları */}
        <Panel title="Fotoğraf Kuralları">
          <form action={updatePhotoRulesAction} className="space-y-2">
            {[
              ["require_start_photo", "Başlangıç fotoğrafı zorunlu"],
              ["require_end_photo", "Bitiş fotoğrafı zorunlu"],
              ["camera_only", "Yalnızca kameradan çekim"],
              ["gallery_upload_enabled", "Galeriden yükleme"],
            ].map(([name, label]) => (
              <label
                className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm"
                key={name}
              >
                <span>{label}</span>
                <input
                  className="h-4 w-4 accent-accent"
                  defaultChecked={Boolean(photoRules.data?.[name as keyof typeof photoRules.data])}
                  name={name}
                  type="checkbox"
                />
              </label>
            ))}
            <SubmitButton
              className="mt-2 h-10 w-full rounded-lg bg-accent text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60"
              label="Kuralları Kaydet"
              pendingLabel="Kaydediliyor..."
            />
          </form>
        </Panel>
      </div>
    </>
  );
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="overflow-hidden rounded-xl bg-panel" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function AddForm({
  action,
  placeholder,
}: {
  action: (formData: FormData) => void | Promise<void>;
  placeholder: string;
}) {
  return (
    <form action={action} className="flex gap-2">
      <input
        className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        name="name"
        placeholder={placeholder}
        required
      />
      <SubmitButton
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-strong"
        pendingLabel={null}
      >
        <Plus size={18} aria-hidden="true" />
      </SubmitButton>
    </form>
  );
}

function Empty() {
  return (
    <p className="rounded-lg bg-panel-muted px-3 py-4 text-center text-sm text-foreground/50">
      Henüz kayıt yok.
    </p>
  );
}

function ProductGroupRow({ item }: { item: ProductGroup }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <form action={updateProductGroupAction} className="flex flex-1 items-center gap-2">
        <input name="id" type="hidden" value={item.id} />
        <input
          className="h-9 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm outline-none transition hover:border-border focus:border-accent focus:bg-panel focus:ring-1 focus:ring-accent/20"
          defaultValue={item.name}
          name="name"
          required
        />
        <SubmitButton
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-accent/40 hover:text-accent disabled:opacity-60"
          label="Kaydet"
          pendingLabel="Kaydediliyor..."
        />
      </form>
      <form action={deleteProductGroupAction}>
        <input name="id" type="hidden" value={item.id} />
        <SubmitButton
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/40 hover:bg-danger/10 hover:text-danger"
          pendingLabel={null}
          title="Sil"
        >
          <Trash2 size={15} aria-hidden="true" />
        </SubmitButton>
      </form>
    </div>
  );
}

function ServiceTypeRow({ item, products }: { item: ServiceType; products: ProductGroup[] }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <form action={updateServiceTypeAction} className="flex flex-1 items-center gap-2">
        <input name="id" type="hidden" value={item.id} />
        <input
          className="h-9 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm outline-none transition hover:border-border focus:border-accent focus:bg-panel focus:ring-1 focus:ring-accent/20"
          defaultValue={item.name}
          name="name"
          required
        />
        <select
          className="h-9 rounded-md border border-transparent bg-transparent px-2 text-xs outline-none hover:border-border focus:border-accent focus:bg-panel"
          defaultValue={item.product_group_id ?? ""}
          name="product_group_id"
        >
          <option value="">Grup yok</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <SubmitButton
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-accent/40 hover:text-accent disabled:opacity-60"
          label="Kaydet"
          pendingLabel="Kaydediliyor..."
        />
      </form>
      <form action={deleteServiceTypeAction}>
        <input name="id" type="hidden" value={item.id} />
        <SubmitButton
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/40 hover:bg-danger/10 hover:text-danger"
          pendingLabel={null}
          title="Sil"
        >
          <Trash2 size={15} aria-hidden="true" />
        </SubmitButton>
      </form>
    </div>
  );
}

function SubcontractorRow({ item }: { item: Subcontractor }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <form action={updateSubcontractorAction} className="flex flex-1 items-center gap-2">
        <input name="id" type="hidden" value={item.id} />
        <input
          className="h-9 flex-1 rounded-md border border-transparent bg-transparent px-2 text-sm outline-none transition hover:border-border focus:border-accent focus:bg-panel focus:ring-1 focus:ring-accent/20"
          defaultValue={item.name}
          name="name"
          required
        />
        <input
          className="h-9 w-28 rounded-md border border-transparent bg-transparent px-2 text-xs outline-none hover:border-border focus:border-accent focus:bg-panel"
          defaultValue={item.contact_name ?? ""}
          name="contact_name"
          placeholder="Sorumlu"
        />
        <input
          className="h-9 w-28 rounded-md border border-transparent bg-transparent px-2 text-xs outline-none hover:border-border focus:border-accent focus:bg-panel"
          defaultValue={item.phone ?? ""}
          name="phone"
          placeholder="Telefon"
        />
        <SubmitButton
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:border-accent/40 hover:text-accent disabled:opacity-60"
          label="Kaydet"
          pendingLabel="Kaydediliyor..."
        />
      </form>
      <form action={deleteSubcontractorAction}>
        <input name="id" type="hidden" value={item.id} />
        <SubmitButton
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground/40 hover:bg-danger/10 hover:text-danger"
          pendingLabel={null}
          title="Sil"
        >
          <Trash2 size={15} aria-hidden="true" />
        </SubmitButton>
      </form>
    </div>
  );
}
