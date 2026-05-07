import { Download } from "lucide-react";

import { PageHeader } from "@/components/layout/AppShell";
import { BarChart } from "@/components/reports/BarChart";
import { PeriodFilter } from "@/components/reports/PeriodFilter";
import { PieChart } from "@/components/reports/PieChart";
import { requireAdmin } from "@/lib/auth";
import { feeLabels, formatCurrency, priorityLabels, statusLabels } from "@/lib/labels";
import { inRange, resolvePeriod, tallyBy } from "@/lib/reports";

type SearchParams = Promise<{ period?: string; from?: string; to?: string }>;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const { period, range } = resolvePeriod(params.period, params.from, params.to);

  const [servicesResult, productsResult, typesResult, membersResult] = await Promise.all([
    supabase.from("services").select("*").order("created_at", { ascending: false }),
    supabase.from("product_groups").select("id,name"),
    supabase.from("service_types").select("id,name"),
    supabase.from("profiles").select("id,full_name"),
  ]);

  const productMap = new Map((productsResult.data ?? []).map((p) => [p.id, p.name]));
  const typeMap = new Map((typesResult.data ?? []).map((t) => [t.id, t.name]));
  const memberMap = new Map((membersResult.data ?? []).map((m) => [m.id, m.full_name]));

  const filtered = (servicesResult.data ?? []).filter((s) => inRange(s.created_at, range));

  const total = filtered.length;
  const paid = filtered.filter((s) => s.fee_type === "paid").length;
  const free = filtered.filter((s) => s.fee_type === "free").length;
  const warranty = filtered.filter((s) => s.fee_type === "warranty").length;
  const completed = filtered.filter((s) => s.status === "completed").length;
  const totalRevenue = filtered
    .filter((s) => s.fee_type === "paid" && s.amount)
    .reduce((sum, s) => sum + (s.amount ?? 0), 0);

  const feeData = [
    { label: feeLabels.free, value: free, color: "#2E7D32" },
    { label: feeLabels.paid, value: paid, color: "#C62828" },
    { label: feeLabels.warranty, value: warranty, color: "#1565C0" },
  ].filter((d) => d.value > 0);

  const statusData = tallyBy(filtered, (s) => statusLabels[s.status]);
  const teamData = [
    {
      label: "Teknik Ekip",
      value: filtered.filter((s) => s.team_type === "technical_team").length,
      color: "#C62828",
    },
    {
      label: "Taşeron",
      value: filtered.filter((s) => s.team_type === "subcontractor").length,
      color: "#F57F17",
    },
  ].filter((d) => d.value > 0);

  const topCities = tallyBy(filtered, (s) => s.district);
  const topProducts = tallyBy(filtered, (s) =>
    s.product_group_id ? productMap.get(s.product_group_id) : null,
  );
  const topTypes = tallyBy(filtered, (s) =>
    s.service_type_id ? typeMap.get(s.service_type_id) : null,
  );
  const topMembers = tallyBy(filtered, (s) =>
    s.member_id ? memberMap.get(s.member_id) : null,
  );
  const topPriorities = tallyBy(filtered, (s) => priorityLabels[s.priority]);

  const excelHref = `/admin/reports/excel?period=${period}${
    params.from ? `&from=${params.from}` : ""
  }${params.to ? `&to=${params.to}` : ""}`;

  const stats = [
    { label: "Toplam Servis", value: String(total), color: "text-foreground" },
    { label: "Tamamlandı", value: String(completed), color: "text-emerald-600" },
    { label: "Ücretli", value: String(paid), color: "text-accent" },
    { label: "Ücretsiz", value: String(free), color: "text-foreground/80" },
    { label: "Garantili", value: String(warranty), color: "text-blue-700" },
    { label: "Toplam Ciro", value: formatCurrency(totalRevenue, "TRY"), color: "text-accent" },
  ];

  return (
    <>
      <PageHeader
        actions={
          <a
            className="flex h-10 items-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] hover:bg-emerald-800"
            href={excelHref}
          >
            <Download size={16} aria-hidden="true" />
            Excel İndir
          </a>
        }
        subtitle={`${range.label} · ${total} servis kaydı analiz edildi`}
        title="Raporlar"
      />

      <PeriodFilter current={period} />

      {/* Stats grid */}
      <section className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            className="rounded-xl bg-panel p-4"
            key={stat.label}
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-foreground/55">
              {stat.label}
            </p>
            <p className={`mt-1.5 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Charts grid */}
      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <ChartCard>
          <PieChart data={feeData} size={170} title="Ücretlendirme Dağılımı" />
        </ChartCard>
        <ChartCard>
          <PieChart data={statusData} size={170} title="Durum Dağılımı" />
        </ChartCard>
        <ChartCard>
          <PieChart data={teamData} size={170} title="Ekip Tipi" />
        </ChartCard>
      </section>

      {/* Top lists */}
      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard>
          <BarChart data={topCities} title="En Yoğun İlçeler" />
        </ChartCard>
        <ChartCard>
          <BarChart data={topProducts} title="Ürün Grubuna Göre" />
        </ChartCard>
        <ChartCard>
          <BarChart data={topTypes} title="Servis Tipine Göre" />
        </ChartCard>
        <ChartCard>
          <BarChart data={topPriorities} title="Önceliğe Göre" />
        </ChartCard>
        <ChartCard>
          <BarChart data={topMembers} title="Üye Performansı (servis sayısı)" />
        </ChartCard>
      </section>

      {total === 0 ? (
        <div className="mt-5 rounded-xl bg-panel p-8 text-center text-sm text-foreground/55" style={{ boxShadow: "var(--shadow-sm)" }}>
          Bu dönem için veri bulunamadı. Farklı bir aralık seçin.
        </div>
      ) : null}
    </>
  );
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-panel p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
      {children}
    </div>
  );
}
