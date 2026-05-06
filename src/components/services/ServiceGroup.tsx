import { ServiceCard } from "@/components/services/ServiceCard";
import type { Service, ServiceLookup } from "@/lib/data";

type ServiceGroupProps = {
  title: string;
  services: Service[];
  lookup: ServiceLookup;
  baseHref: string;
};

export function ServiceGroup({
  title,
  services,
  lookup,
  baseHref,
}: ServiceGroupProps) {
  return (
    <details className="rounded-lg border border-border bg-panel" open>
      <summary className="cursor-pointer px-4 py-3 text-base font-semibold">
        {title} ({services.length})
      </summary>
      <div className="space-y-3 border-t border-border p-3">
        {services.length ? (
          services.map((service) => (
            <ServiceCard
              href={`${baseHref}/${service.id}`}
              key={service.id}
              lookup={lookup}
              service={service}
            />
          ))
        ) : (
          <p className="rounded-md bg-background px-3 py-6 text-center text-sm text-foreground/60">
            Bu grupta kayıt yok.
          </p>
        )}
      </div>
    </details>
  );
}
