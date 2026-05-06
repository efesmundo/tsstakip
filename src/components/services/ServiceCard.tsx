import Link from "next/link";

import { PriorityBadge, StatusBadge } from "@/components/services/StatusBadge";
import type { Service, ServiceLookup } from "@/lib/data";
import { feeLabels, formatCurrency, formatDateTime } from "@/lib/labels";

type ServiceCardProps = {
  service: Service;
  lookup: ServiceLookup;
  href: string;
};

export function ServiceCard({ service, lookup, href }: ServiceCardProps) {
  const product = service.product_group_id
    ? lookup.products.get(service.product_group_id)?.name
    : null;
  const type = service.service_type_id
    ? lookup.types.get(service.service_type_id)?.name
    : null;
  const member = service.member_id ? lookup.members.get(service.member_id) : null;

  return (
    <Link
      className="block rounded-lg border border-border bg-panel p-4 transition hover:border-accent/50 hover:bg-panel-muted"
      href={href}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{service.customer_name}</h3>
            <StatusBadge status={service.status} />
            <PriorityBadge priority={service.priority} />
          </div>
          <p className="mt-1 text-sm text-foreground/70">
            {service.address} {service.district ? `- ${service.district}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-background px-2 py-1">Site ID: {service.site_id}</span>
            <span className="rounded-md bg-background px-2 py-1">Proje: {service.project_name ?? "-"}</span>
            <span className="rounded-md bg-background px-2 py-1">Ürün: {product ?? "-"}</span>
            <span className="rounded-md bg-background px-2 py-1">Tip: {type ?? "-"}</span>
          </div>
        </div>
        <div className="min-w-44 text-sm md:text-right">
          <p className="font-medium">{member?.full_name ?? "Üye yok"}</p>
          <p className="text-foreground/65">{formatDateTime(service.scheduled_at)}</p>
          <p className="mt-2 font-medium">
            {feeLabels[service.fee_type]} · {formatCurrency(service.amount, service.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
