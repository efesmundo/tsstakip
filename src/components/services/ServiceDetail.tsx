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

type ServiceDetailProps = {
  service: Service;
  products: ProductGroup[];
  serviceTypes: ServiceType[];
  members: Profile[];
  subcontractors: Subcontractor[];
  photos: ServicePhoto[];
  role: "admin" | "member";
};

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
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{service.customer_name}</h2>
            <StatusBadge status={service.status} />
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <Row label="Telefon" value={service.customer_phone} />
            <Row label="Adres" value={service.address} />
            <Row label="İlçe" value={service.district ?? "-"} />
            <Row label="Site ID" value={service.site_id} />
            <Row label="Proje" value={service.project_name ?? "-"} />
            <Row label="Ürün Grubu" value={product?.name ?? "-"} />
            <Row label="Servis Tipi" value={type?.name ?? "-"} />
            <Row label="Üye" value={member?.full_name ?? "-"} />
            <Row label="Öncelik" value={priorityLabels[service.priority]} />
            <Row label="Planlanan" value={formatDateTime(service.scheduled_at)} />
            <Row label="Ücret" value={`${feeLabels[service.fee_type]} · ${formatCurrency(service.amount, service.currency)}`} />
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-panel p-4">
          <h3 className="font-semibold">Zaman Takibi</h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <Row label="Başlangıç" value={formatDateTime(service.started_at)} />
            <Row label="Bitiş" value={formatDateTime(service.completed_at)} />
            <Row label="Onay Gönderimi" value={formatDateTime(service.customer_approval_sent_at)} />
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-panel p-4">
          <h3 className="font-semibold">Fotoğraflar</h3>
          <div className="mt-3 grid gap-3">
            <PhotoCapture label="Başlangıç Fotoğrafı" photoType="start" serviceId={service.id} />
            <PhotoCapture label="Bitiş Fotoğrafı" photoType="end" serviceId={service.id} />
            <PhotoCapture label="Ara Fotoğraf" photoType="during" serviceId={service.id} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
            {photos.length ? (
              photos.map((photo) => (
                <div className="rounded-md border border-border bg-background p-2 text-xs" key={photo.id}>
                  <p className="font-semibold">{photo.photo_type}</p>
                  <p className="mt-1 break-all text-foreground/65">{photo.storage_path}</p>
                </div>
              ))
            ) : (
              <p className="col-span-full rounded-md bg-background px-3 py-6 text-center text-sm text-foreground/60">
                Henüz fotoğraf yok. Fotoğraflar yalnızca kameradan çekilir.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-panel p-4">
          <h3 className="font-semibold">Aksiyonlar</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["in_progress", "Servisi Başlat"],
              ["completed", "Tamamlandı İşaretle"],
              ["approved", "Onayla"],
              ["rejected", "Reddet"],
            ].map(([status, label]) => (
              <form action={updateServiceStatusAction} key={status}>
                <input name="id" type="hidden" value={service.id} />
                <input name="status" type="hidden" value={status} />
                <button className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-panel-muted">
                  {label}
                </button>
              </form>
            ))}
            {role === "admin" ? (
              <form action={deleteServiceAction}>
                <input name="id" type="hidden" value={service.id} />
                <button className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
                  Sil
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      {role === "admin" ? (
        <section>
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
        </section>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3">
      <dt className="text-foreground/60">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
