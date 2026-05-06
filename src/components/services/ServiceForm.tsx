import type {
  ProductGroup,
  Profile,
  Service,
  ServiceType,
  Subcontractor,
} from "@/lib/data";
import { feeLabels, priorityLabels, statusLabels } from "@/lib/labels";
import type { FeeType, ServicePriority, ServiceStatus } from "@/lib/supabase/types";

type ServiceFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  service?: Service;
  products: ProductGroup[];
  serviceTypes: ServiceType[];
  members: Profile[];
  subcontractors: Subcontractor[];
  mode: "create" | "edit";
  role: "admin" | "member";
};

const priorities: ServicePriority[] = ["urgent", "high", "normal", "low"];
const statuses: ServiceStatus[] = [
  "pending",
  "in_progress",
  "awaiting_approval",
  "approved",
  "completed",
  "canceled",
  "rejected",
];
const feeTypes: FeeType[] = ["free", "paid", "warranty"];

function inputDateTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

export function ServiceForm({
  action,
  service,
  products,
  serviceTypes,
  members,
  subcontractors,
  mode,
  role,
}: ServiceFormProps) {
  const isAdmin = role === "admin";

  return (
    <form action={action} className="space-y-6">
      {service ? <input name="id" type="hidden" value={service.id} /> : null}

      <section className="rounded-lg border border-border bg-panel p-4">
        <h2 className="text-lg font-semibold">1. Müşteri</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Ad Soyad" name="customer_name" required value={service?.customer_name} />
          <Field label="Telefon" name="customer_phone" required value={service?.customer_phone} />
          <Field className="md:col-span-2" label="Adres" name="address" required value={service?.address} />
          <Field label="İlçe" name="district" value={service?.district} />
          <Field label="Site ID" name="site_id" required value={service?.site_id} />
          <Field label="Proje Adı" name="project_name" value={service?.project_name} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-panel p-4">
        <h2 className="text-lg font-semibold">2. Servis Detayı</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Select label="Ürün Grubu" name="product_group_id" value={service?.product_group_id}>
            <option value="">Seçiniz</option>
            {products.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
          <Select label="Servis Tipi" name="service_type_id" value={service?.service_type_id}>
            <option value="">Seçiniz</option>
            {serviceTypes.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
          <Select label="Öncelik" name="priority" value={service?.priority ?? "normal"}>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>{priorityLabels[priority]}</option>
            ))}
          </Select>
          <Field
            label="Tarih ve Saat"
            name="scheduled_at"
            type="datetime-local"
            value={inputDateTime(service?.scheduled_at)}
          />
          {isAdmin && mode === "edit" ? (
            <Select label="Durum" name="status" value={service?.status ?? "pending"}>
              {statuses.map((status) => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </Select>
          ) : null}
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium">Açıklama</span>
            <textarea
              className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none"
              defaultValue={service?.description ?? ""}
              name="description"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-panel p-4">
        <h2 className="text-lg font-semibold">3. Ekip ve Ücret</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {isAdmin ? (
            <Select label="Üye" name="member_id" value={service?.member_id}>
              <option value="">Seçiniz</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.full_name}</option>
              ))}
            </Select>
          ) : null}
          <Select label="Ekip Tipi" name="team_type" value={service?.team_type ?? "technical_team"}>
            <option value="technical_team">Teknik Ekip</option>
            <option value="subcontractor">Taşeron</option>
          </Select>
          <Select label="Taşeron Firma" name="subcontractor_id" value={service?.subcontractor_id}>
            <option value="">Yok</option>
            {subcontractors.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </Select>
          <Field label="Taşeron Sorumlu" name="subcontractor_contact" value={service?.subcontractor_contact} />
          <Field label="Taşeron Telefon" name="subcontractor_phone" value={service?.subcontractor_phone} />
          <Select label="Ücretlendirme" name="fee_type" value={service?.fee_type ?? "free"}>
            {feeTypes.map((fee) => (
              <option key={fee} value={fee}>{feeLabels[fee]}</option>
            ))}
          </Select>
          <Field label="Tutar" name="amount" type="number" value={service?.amount?.toString()} />
          <Field label="Para Birimi" name="currency" value={service?.currency ?? "TRY"} />
          <Select label="Ödeme Durumu" name="payment_status" value={service?.payment_status}>
            <option value="">Seçiniz</option>
            <option value="pending">Bekliyor</option>
            <option value="paid">Ödendi</option>
            <option value="partial">Kısmi</option>
          </Select>
          <Field label="Garanti Kodu" name="warranty_code" value={service?.warranty_code} />
          <Field label="Garanti Bitiş Tarihi" name="warranty_expires_at" type="date" value={service?.warranty_expires_at} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-panel p-4">
        <h2 className="text-lg font-semibold">4. Özet ve SMS</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Ücretli servislerde kayıt oluşturulduğunda durum Onay Bekliyor olur. Netgsm SMS entegrasyonu için API anahtarları eklendiğinde bu özet metin müşteriye gönderilecek.
        </p>
        <div className="mt-3 rounded-md bg-background p-3 text-sm text-foreground/75">
          Sayın [Ad Soyad], [TUTAR] tutarında ücretli servis talebiniz oluşturulmuştur. Onaylamanız durumunda servisiniz planlanacak ve ekibimiz sizinle iletişime geçecektir.
        </div>
      </section>

      <button className="h-12 rounded-md bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-strong">
        {mode === "edit" ? "Servisi Güncelle" : "Servisi Kaydet"}
      </button>
    </form>
  );
}

function Field({
  className = "",
  label,
  name,
  required,
  type = "text",
  value,
}: {
  className?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value?: string | null;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none"
        defaultValue={value ?? ""}
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
  value?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none"
        defaultValue={value ?? ""}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}
