import {
  deleteServiceAction,
  updateServiceAction,
  updateServiceStatusAction,
} from "@/app/actions";
import { PhotoCapture } from "@/components/services/PhotoCapture";
import { ServiceForm } from "@/components/services/ServiceForm";
import { StatusBadge } from "@/components/services/StatusBadge";
import type {
  ProductGroup,
  Profile,
  Service,
  ServicePhoto,
  ServiceType,
  Subcontractor,
} from "@/lib/data";
import { feeLabels, formatCurrency, formatDateTime, priorityLabels } from "@/lib/labels";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function photoUrl(storagePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/service-photos/${storagePath}`;
}

const photoTypeLabels: Record<string, string> = {
  start: "Başlangıç",
  end: "Bitiş",
  during: "Ara",
};

type ServiceDetailProps = {
  service: Service;
  products: ProductGroup[];
  serviceTypes: ServiceType[];
  members: Profile[];
  subcontractors: Subcontractor[];
  photos: ServicePhoto[];
  role: "admin" | "member";
};

const statusActions: [string, string][] = [
  ["in_progress", "Başlat"],
  ["completed", "Tamamlandı"],
  ["approved", "Onayla"],
  ["rejected", "Reddet"],
];

export function ServiceDetail({
  service,
  products,
  serviceTypes,
  members,
  subcontractors,
  photos,
  role,
}: ServiceDetailProps) {
  const product = products.find((item) => item.id === service.product_group_id);
  const type = serviceTypes.find((item) => item.id === service.service_type_id);
  const member = members.find((item) => item.id === service.member_id);

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4">

        {/* Info card */}
        <Card>
          <div className="flex flex-wrap items-start gap-2">
            <h2 className="flex-1 text-xl font-bold">{service.customer_name}</h2>
            <StatusBadge status={service.status} />
          </div>
          <dl className="mt-4 divide-y divide-border text-sm">
            <Row label="Telefon" value={service.customer_phone} />
            <Row label="Adres" value={service.address} />
            <Row label="İlçe" value={service.district ?? "—"} />
            <Row label="Site ID" value={service.site_id} />
            <Row label="Proje" value={service.project_name ?? "—"} />
            <Row label="Ürün Grubu" value={product?.name ?? "—"} />
            <Row label="Servis Tipi" value={type?.name ?? "—"} />
            <Row label="Üye" value={member?.full_name ?? "—"} />
            <Row label="Öncelik" value={priorityLabels[service.priority]} />
            <Row label="Planlanan" value={formatDateTime(service.scheduled_at)} />
            <Row label="Ücret" value={`${feeLabels[service.fee_type]} · ${formatCurrency(service.amount, service.currency)}`} />
          </dl>
        </Card>

        {/* Timeline card */}
        <Card title="Zaman Takibi">
          <dl className="divide-y divide-border text-sm">
            <Row label="Başlangıç" value={formatDateTime(service.started_at)} />
            <Row label="Bitiş" value={formatDateTime(service.completed_at)} />
            <Row label="Onay Gönderimi" value={formatDateTime(service.customer_approval_sent_at)} />
          </dl>
        </Card>

        {/* Photos card */}
        <Card title="Fotoğraflar">
          <div className="space-y-3">
            <PhotoCapture label="Başlangıç Fotoğrafı" photoType="start" serviceId={service.id} />
            <PhotoCapture label="Bitiş Fotoğrafı" photoType="end" serviceId={service.id} />
            <PhotoCapture label="Ara Fotoğraf" photoType="during" serviceId={service.id} />
          </div>
          {photos.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {photos.map((photo) => (
                <a
                  className="group overflow-hidden rounded-lg border border-border bg-panel-muted"
                  href={photoUrl(photo.storage_path)}
                  key={photo.id}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={photoTypeLabels[photo.photo_type] ?? photo.photo_type}
                    className="aspect-video w-full object-cover transition group-hover:opacity-90"
                    loading="lazy"
                    src={photoUrl(photo.storage_path)}
                  />
                  <p className="px-2 py-1 text-xs font-medium text-foreground/70">
                    {photoTypeLabels[photo.photo_type] ?? photo.photo_type}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-panel-muted px-3 py-5 text-center text-sm text-foreground/50">
              Henüz fotoğraf yok.
            </p>
          )}
        </Card>

        {/* Actions card */}
        <Card title="Aksiyonlar">
          <div className="flex flex-wrap gap-2">
            {statusActions.map(([status, label]) => (
              <form action={updateServiceStatusAction} key={status}>
                <input name="id" type="hidden" value={service.id} />
                <input name="status" type="hidden" value={status} />
                <button className="rounded-lg border border-border bg-panel px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40 hover:bg-accent-surface hover:text-accent">
                  {label}
                </button>
              </form>
            ))}
          </div>
          {role === "admin" ? (
            <form action={deleteServiceAction} className="mt-3 border-t border-border pt-3">
              <input name="id" type="hidden" value={service.id} />
              <button className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/15">
                Servisi Sil
              </button>
            </form>
          ) : null}
        </Card>
      </section>

      {role === "admin" ? (
        <section>
          <div className="rounded-xl bg-panel p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h3 className="mb-5 text-lg font-semibold">Servisi Düzenle</h3>
            <ServiceForm
              action={updateServiceAction}
              members={members}
              mode="edit"
              products={products}
              role="admin"
              service={service}
              serviceTypes={serviceTypes}
              subcontractors={subcontractors}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl bg-panel p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
      {title ? <h3 className="mb-3 font-semibold text-foreground">{title}</h3> : null}
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <dt className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-foreground/50">{label}</dt>
      <dd className="flex-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
