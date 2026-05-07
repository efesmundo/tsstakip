"use client";

import { useMemo, useState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import type {
  ProductGroup,
  Profile,
  Service,
  ServiceType,
  Subcontractor,
} from "@/lib/data";
import { feeLabels, priorityLabels, statusLabels } from "@/lib/labels";
import type { FeeType, ServicePriority, ServiceStatus, TeamType } from "@/lib/supabase/types";

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
  const initialTeamType = service?.team_type ?? "technical_team";
  const [teamType, setTeamType] = useState(initialTeamType);
  const [subcontractorId, setSubcontractorId] = useState(service?.subcontractor_id ?? "");
  const selectedSubcontractor = useMemo(
    () => subcontractors.find((item) => item.id === subcontractorId),
    [subcontractorId, subcontractors],
  );
  const isSubcontractorTeam = teamType === "subcontractor";
  const isTechnicalTeam = teamType === "technical_team";
  const subcontractorContact =
    selectedSubcontractor?.contact_name ?? service?.subcontractor_contact ?? "";
  const subcontractorPhone =
    selectedSubcontractor?.phone ?? service?.subcontractor_phone ?? "";

  return (
    <form action={action} className="space-y-5">
      {service ? <input name="id" type="hidden" value={service.id} /> : null}

      <Section step="1" title="Müşteri Bilgileri">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Ad Soyad" name="customer_name" required value={service?.customer_name} />
          <Field label="Telefon" name="customer_phone" required value={service?.customer_phone} />
          <Field className="md:col-span-2" label="Adres" name="address" required value={service?.address} />
          <Field label="İlçe" name="district" value={service?.district} />
          <Field label="Site ID" name="site_id" required value={service?.site_id} />
          <Field className="md:col-span-2" label="Proje Adı" name="project_name" value={service?.project_name} />
        </div>
      </Section>

      <Section step="2" title="Servis Detayı">
        <div className="grid gap-4 md:grid-cols-2">
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
            label="Planlanan Tarih / Saat"
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
            <span className="mb-1.5 block text-sm font-medium text-foreground/75">Açıklama</span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
              defaultValue={service?.description ?? ""}
              name="description"
            />
          </label>
        </div>
      </Section>

      <Section step="3" title="Ekip ve Ücret">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Ekip Tipi"
            name="team_type"
            onChange={(value) => setTeamType(value as TeamType)}
            value={teamType}
          >
            <option value="technical_team">Teknik Ekip</option>
            <option value="subcontractor">Taşeron</option>
          </Select>
          {isAdmin && isTechnicalTeam ? (
            <Select label="Teknik Ekip Üyesi" name="member_id" value={service?.member_id}>
              <option value="">Seçiniz</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.full_name}</option>
              ))}
            </Select>
          ) : null}
          {isSubcontractorTeam ? (
            <>
              <Select
                label="Taşeron Firma"
                name="subcontractor_id"
                onChange={setSubcontractorId}
                required
                value={subcontractorId}
              >
                <option value="">Seçiniz</option>
                {subcontractors.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </Select>
              <Field
                label="Taşeron Sorumlu"
                name="subcontractor_contact"
                readOnly
                value={subcontractorContact}
              />
              <Field
                label="Taşeron Telefon"
                name="subcontractor_phone"
                readOnly
                value={subcontractorPhone}
              />
            </>
          ) : null}
          <Select label="Ücretlendirme" name="fee_type" value={service?.fee_type ?? "free"}>
            {feeTypes.map((fee) => (
              <option key={fee} value={fee}>{feeLabels[fee]}</option>
            ))}
          </Select>
          <Field label="Tutar" name="amount" type="number" value={service?.amount?.toString()} />
          <Field label="Para Birimi" name="currency" value={service?.currency ?? "TRY"} />
        </div>
      </Section>

      <Section step="4" title="Özet">
        <p className="text-sm text-foreground/65">
          Ücretsiz servisler doğrudan <strong>Onaylandı</strong> olarak açılır. Ücretli servislerde kayıt oluşturulduğunda durum <strong>Onay Bekliyor</strong> olarak işaretlenir.
        </p>
      </Section>

      <SubmitButton
        label={mode === "edit" ? "Servisi Güncelle" : "Servisi Kaydet"}
        pendingLabel={mode === "edit" ? "Güncelleniyor..." : "Kaydediliyor..."}
      />
    </form>
  );
}

function Section({ step, title, children }: { step: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          {step}
        </span>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  className = "",
  label,
  name,
  required,
  readOnly,
  type = "text",
  value,
}: {
  className?: string;
  label: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  type?: string;
  value?: string | null;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-foreground/75">{label}</span>
      <input
        className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        defaultValue={readOnly ? undefined : value ?? ""}
        name={name}
        readOnly={readOnly}
        required={required}
        type={type}
        value={readOnly ? value ?? "" : undefined}
      />
    </label>
  );
}

function Select({
  children,
  label,
  name,
  onChange,
  required,
  value,
}: {
  children: React.ReactNode;
  label: string;
  name: string;
  onChange?: (value: string) => void;
  required?: boolean;
  value?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground/75">{label}</span>
      <select
        className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
        defaultValue={value ?? ""}
        name={name}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        required={required}
      >
        {children}
      </select>
    </label>
  );
}
