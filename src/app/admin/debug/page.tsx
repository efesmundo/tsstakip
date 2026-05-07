import { PageHeader } from "@/components/layout/AppShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

export default async function DebugPage() {
  await requireAdmin();

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  const secret = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    ""
  ).trim();

  const checks: Check[] = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      ok: Boolean(url) && /^https:\/\/.+\.supabase\.co\/?$/i.test(url),
      detail: url
        ? `Uzunluk: ${url.length} | Değer: "${url}"`
        : "Tanımlı değil",
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ok: anon.startsWith("eyJ") || anon.startsWith("sb_publishable_"),
      detail: anon
        ? `Uzunluk: ${anon.length} | İlk 8 karakter: "${anon.slice(0, 8)}..."`
        : "Tanımlı değil",
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      ok: secret.startsWith("eyJ") || secret.startsWith("sb_secret_"),
      detail: secret
        ? `Uzunluk: ${secret.length} | İlk 8 karakter: "${secret.slice(0, 8)}..." | Format: ${secret.startsWith("eyJ") ? "JWT (eyJ)" : secret.startsWith("sb_secret_") ? "sb_secret_ prefix" : "BEKLENMEYEN"}`
        : "Tanımlı değil",
    },
  ];

  // Live test: hit Supabase Auth admin endpoint directly
  let liveResult: { status: number; bodyPreview: string; isHtml: boolean; error?: string } | null = null;
  if (url && secret) {
    try {
      const cleanUrl = url.replace(/\/$/, "");
      const response = await fetch(`${cleanUrl}/auth/v1/admin/users?page=1&per_page=1`, {
        headers: {
          Authorization: `Bearer ${secret}`,
          apikey: secret,
        },
        cache: "no-store",
      });
      const body = await response.text();
      liveResult = {
        status: response.status,
        bodyPreview: body.slice(0, 500),
        isHtml: body.trimStart().startsWith("<"),
      };
    } catch (err) {
      liveResult = {
        status: 0,
        bodyPreview: "",
        isHtml: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return (
    <>
      <PageHeader
        subtitle="Bu sayfa env değişkenleri ve Supabase bağlantısını teşhis eder"
        title="Debug"
      />

      <section className="space-y-3">
        {checks.map((check) => (
          <div
            className="rounded-xl bg-panel p-4"
            key={check.name}
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                  check.ok ? "bg-emerald-600" : "bg-danger"
                }`}
              >
                {check.ok ? "✓" : "✗"}
              </span>
              <code className="font-mono text-sm font-semibold">{check.name}</code>
            </div>
            <p className="mt-2 break-all pl-8 text-xs text-foreground/70">{check.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Canlı API Testi</h2>
        <div className="rounded-xl bg-panel p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
          {!liveResult ? (
            <p className="text-sm text-foreground/60">URL veya secret tanımlı değil — test atlandı.</p>
          ) : liveResult.error ? (
            <div>
              <p className="text-sm font-semibold text-danger">Network hatası</p>
              <pre className="mt-2 overflow-auto rounded-md bg-panel-muted p-3 text-xs">{liveResult.error}</pre>
            </div>
          ) : (
            <div>
              <p className="text-sm">
                <strong>HTTP Status:</strong>{" "}
                <span className={liveResult.status >= 200 && liveResult.status < 300 ? "text-emerald-700" : "text-danger"}>
                  {liveResult.status}
                </span>
              </p>
              <p className="mt-1 text-sm">
                <strong>Response tipi:</strong>{" "}
                <span className={liveResult.isHtml ? "text-danger" : "text-emerald-700"}>
                  {liveResult.isHtml ? "HTML (sorun var)" : "JSON (normal)"}
                </span>
              </p>
              <p className="mt-3 text-sm font-semibold">Response gövdesi (ilk 500 karakter):</p>
              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-panel-muted p-3 text-xs">
                {liveResult.bodyPreview || "(boş)"}
              </pre>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-sm">
        <p className="font-semibold text-amber-900">Yorum rehberi</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900/80">
          <li><strong>HTTP 200 + JSON</strong>: Her şey çalışıyor. Üye ekleme aksiyonunda farklı bir bug var demektir.</li>
          <li><strong>HTTP 401 + JSON</strong>: Service role key yanlış / başka bir projeye ait.</li>
          <li><strong>HTTP 404/503 + HTML</strong>: URL hatalı veya proje paused.</li>
          <li><strong>Network hatası</strong>: URL erişilemez (typo, DNS).</li>
          <li><strong>Format check kırmızı</strong>: Env değişkeni yanlış kopyalanmış.</li>
        </ul>
      </section>
    </>
  );
}
