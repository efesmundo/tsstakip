import { PageHeader } from "@/components/layout/AppShell";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Check = {
  name: string;
  ok: boolean;
  detail: string;
};

async function runCreateUserTestAction(formData: FormData) {
  "use server";
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  if (!email || !password) return;

  const supabase = getSupabaseAdminClient();
  let stage = "init";
  try {
    stage = "auth.admin.createUser";
    const result = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    const stringified = JSON.stringify(
      {
        ok: !result.error,
        userId: result.data?.user?.id ?? null,
        userEmail: result.data?.user?.email ?? null,
        error: result.error
          ? { message: result.error.message, status: result.error.status, name: result.error.name }
          : null,
      },
      null,
      2,
    );
    const { redirect } = await import("next/navigation");
    redirect(`/admin/debug?testResult=${encodeURIComponent(stringified)}`);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
        (error as { digest: string }).digest.startsWith("NEXT_NOT_FOUND"))
    ) {
      throw error;
    }
    const payload = JSON.stringify(
      {
        thrown: true,
        stage,
        type: error?.constructor?.name ?? typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5).join("\n") : null,
      },
      null,
      2,
    );
    const { redirect } = await import("next/navigation");
    redirect(`/admin/debug?testResult=${encodeURIComponent(payload)}`);
  }
}

export default async function DebugPage({
  searchParams,
}: {
  searchParams: Promise<{ testResult?: string }>;
}) {
  await requireAdmin();
  const { testResult } = await searchParams;

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
      detail: url ? `Uzunluk: ${url.length} | Değer: "${url}"` : "Tanımlı değil",
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

  // Live GET test against admin endpoint
  let liveResult: { status: number; bodyPreview: string; isHtml: boolean; error?: string } | null = null;
  if (url && secret) {
    try {
      const cleanUrl = url.replace(/\/$/, "");
      const response = await fetch(`${cleanUrl}/auth/v1/admin/users?page=1&per_page=1`, {
        headers: { Authorization: `Bearer ${secret}`, apikey: secret },
        cache: "no-store",
      });
      const body = await response.text();
      liveResult = {
        status: response.status,
        bodyPreview: body.slice(0, 500),
        isHtml: body.trimStart().startsWith("<"),
      };
    } catch (err) {
      liveResult = { status: 0, bodyPreview: "", isHtml: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return (
    <>
      <PageHeader subtitle="Bu sayfa env değişkenleri ve Supabase bağlantısını teşhis eder" title="Debug" />

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
        <h2 className="mb-3 text-lg font-semibold">GET /auth/v1/admin/users (kullanıcı listesi)</h2>
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
                {" · "}
                <strong>Response:</strong>{" "}
                <span className={liveResult.isHtml ? "text-danger" : "text-emerald-700"}>
                  {liveResult.isHtml ? "HTML" : "JSON"}
                </span>
              </p>
              <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-panel-muted p-3 text-xs">
                {liveResult.bodyPreview || "(boş)"}
              </pre>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Test: supabase.auth.admin.createUser()</h2>
        <div className="rounded-xl bg-panel p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
          <p className="mb-3 text-sm text-foreground/70">
            Bu test, üye ekleme aksiyonunun kullandığı çağrının aynısını yapar. Sonuç aşağıda raw JSON
            olarak görünür.
          </p>
          <form action={runCreateUserTestAction} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              defaultValue={`test-${Date.now()}@example.com`}
              name="email"
              type="email"
              required
            />
            <input
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent"
              defaultValue="TestPassword123!"
              name="password"
              type="text"
              required
            />
            <button
              className="h-11 rounded-lg bg-accent px-4 text-sm font-semibold text-white"
              type="submit"
            >
              Test Et
            </button>
          </form>

          {testResult ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Sonuç:</p>
              <pre className="max-h-96 overflow-auto rounded-md bg-panel-muted p-3 text-xs">
                {decodeURIComponent(testResult)}
              </pre>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-amber-300/40 bg-amber-50 p-4 text-sm">
        <p className="font-semibold text-amber-900">Yorum rehberi</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900/80">
          <li>Test sonucu <code>userId</code> içeriyorsa: createUser çalışıyor, üye ekleme aksiyonunda başka bir bug var.</li>
          <li>Sonuç <code>error: {`{`}message...{`}`}</code> içeriyorsa: Supabase'in döndüğü gerçek hata.</li>
          <li>Sonuç <code>thrown: true</code> içeriyorsa: client/parse seviyesinde patlama. <code>message</code> bize sebebi söyler.</li>
        </ul>
      </section>
    </>
  );
}
