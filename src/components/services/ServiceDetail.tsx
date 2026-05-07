import { Trash2 } from "lucide-react";

import {
  deleteServiceAction,
  deleteServicePhotoAction,
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
import { feeLabels, formatCurrency, formatDateTime, priorityLabels, teamLabels } from "@/lib/labels";

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
  galleryEnabled?: boolean;
};

const statusActions: [string, string][] = [
  ["in_progress", "Başlat"],
  ["completed", "Tamamlandı"],
  ["approved", "Onayla"],
  ["rejected", "Reddet"],
];

function photoDisabledReason(role: "admin" | "member", status: Service["status"], photoType: "start" | "end" | "during") {
  if (role === "admin") return undefined;
  if (status === "rejected" || status === "canceled") return "Bu servis için fotoğraf eklenemez.";
  if (photoType === "start" && status !== "approved") return "Başlangıç fotoğrafı için servis onaylanmış olmalı.";
  if (photoType === "end" && status !== "in_progress") return "Bitiş fotoğrafı için servis başlamış olmalı.";
  if (photoType === "during" && status !== "in_progress") return "Ara fotoğraf için servis başlamış olmalı.";
  return undefined;
}

export function ServiceDetail({
  service,
  products,
  serviceTypes,
  members,
  subcontractors,
  photos,
  role,
  galleryEnabled = true,
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
            <span className="rounded-md bg-panel-muted px-2.5 py-1 text-sm font-semibold text-foreground/70">
              {service.service_number}
            </span>
            <StatusBadge status={service.status} />
          </div>
          <dl className="mt-4 divide-y divide-border text-sm">
            <Row label="Servis No" value={service.service_number} />
            <Row label="Telefon" value={service.customer_phone} />
            <Row label="Adres" value={service.address} />
            <Row label="İlçe" value={service.district ?? "—"} />
            <Row label="Site ID" value={service.site_id} />
            <Row label="Proje" value={service.project_name ?? "—"} />
            <Row label="Ürün Grubu" value={product?.name ?? "—"} />
            <Row label="Servis Tipi" value={type?.name ?? "—"} />
            <Row label="Ekip Tipi" value={teamLabels[service.team_type]} />
            <Row label="Üye" value={member?.full_name ?? "—"} />
            {service.team_type === "subcontractor" ? (
              <>
                <Row label="Taşeron" value={subcontractors.find((item) => item.id === service.subcontractor_id)?.name ?? "—"} />
                <Row label="Sorumlu" value={service.subcontractor_contact ?? "—"} />
                <Row label="Taşeron Tel" value={service.subcontractor_phone ?? "—"} />
              </>
            ) : null}
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
            <PhotoCapture
              disabledReason={photoDisabledReason(role, service.status, "start")}
              galleryEnabled={galleryEnabled}
              label="Başlangıç Fotoğrafı"
              photoType="start"
              serviceId={service.id}
              serviceStatus={service.status}
            />
            <PhotoCapture
              disabledReason={photoDisabledReason(role, service.status, "end")}
              galleryEnabled={galleryEnabled}
              label="Bitiş Fotoğrafı"
              photoType="end"
              serviceId={service.id}
              serviceStatus={service.status}
            />
            <PhotoCapture
              disabledReason={photoDisabledReason(role, service.status, "during")}
              galleryEnabled={galleryEnabled}
              label="Ara Fotoğraf"
              photoType="during"
              serviceId={service.id}
              serviceStatus={service.status}
            />
          </div>
          {photos.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
              {photos.map((photo) => (
                <div
                  className="group relative overflow-hidden rounded-lg border border-border bg-panel-muted"
                  key={photo.id}
                >
                  <a
                    className="block"
                    href={photoUrl(photo.storage_path)}
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
                  </a>
                  <div className="flex items-center justify-between gap-2 px-2 py-1">
                    <p className="text-xs font-medium text-foreground/70">
                      {photoTypeLabels[photo.photo_type] ?? photo.photo_type}
                    </p>
                    <form action={deleteServicePhotoAction}>
                      <input name="id" type="hidden" value={photo.id} />
                      <input name="service_id" type="hidden" value={service.id} />
                      <input name="storage_path" type="hidden" value={photo.storage_path} />
                      <button
                        aria-label="Fotoğrafı sil"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-foreground/40 transition active:scale-90 hover:bg-danger/10 hover:text-danger"
                        title="Fotoğrafı sil"
                        type="submit"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-lg bg-panel-muted px-3 py-5 text-center text-sm text-foreground/50">
              Henüz fotoğraf yok.
            </p>
          )}
        </Card>

        {role === "admin" ? (
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
            <form action={deleteServiceAction} className="mt-3 border-t border-border pt-3">
              <input name="id" type="hidden" value={service.id} />
              <button className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger/15">
                Servisi Sil
              </button>
            </form>
          </Card>
        ) : null}
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
