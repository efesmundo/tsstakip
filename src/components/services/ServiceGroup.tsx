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
    <section className="overflow-hidden rounded-xl bg-panel" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="font-semibold text-foreground">{title}</h2>
        <span className="rounded-full bg-panel-muted px-2.5 py-0.5 text-xs font-semibold text-foreground/60">
          {services.length}
        </span>
      </div>
      <div className="p-3 space-y-2.5">
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
          <p className="rounded-lg bg-panel-muted px-3 py-8 text-center text-sm text-foreground/50">
            Bu grupta kayıt yok.
          </p>
        )}
      </div>
    </section>
  );
}
