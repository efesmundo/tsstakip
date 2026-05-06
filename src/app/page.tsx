import { Camera, ClipboardList } from "lucide-react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-8 px-5 py-6 md:grid-cols-[0.92fr_1.08fr] md:items-center md:px-8">
        <div className="rounded-lg border border-border bg-panel p-6 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-accent text-white">
              <ClipboardList size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-accent-strong">Tedeta</p>
              <h1 className="text-2xl font-semibold">Servis Yönetimi</h1>
            </div>
          </div>

          <LoginForm />
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-accent-strong">
              Web uygulaması başlangıcı hazır
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
              Admin ve üye servis kayıtları tarayıcıdan yönetilecek.
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Bugün", "12"],
              ["Onay Bekliyor", "4"],
              ["Tamamlandı", "9"],
              ["Acil", "2"],
            ].map(([label, value]) => (
              <div
                className="rounded-lg border border-border bg-panel p-4"
                key={label}
              >
                <p className="text-sm text-foreground/70">{label}</p>
                <p className="mt-2 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-panel p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Kamera zorunlu fotoğraf akışı</h3>
                <p className="text-sm text-foreground/70">
                  Web sürümünde fotoğraf çekimi tarayıcı kamerası ile yapılacak.
                </p>
              </div>
              <Camera className="text-accent-strong" size={24} aria-hidden="true" />
            </div>
            <div className="h-2 rounded-full bg-panel-muted">
              <div className="h-2 w-2/3 rounded-full bg-accent" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
