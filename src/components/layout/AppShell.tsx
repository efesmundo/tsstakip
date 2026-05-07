import Link from "next/link";

import { SignOutButton } from "@/components/auth/SignOutButton";

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function AppShell({ title, subtitle, nav, children, actions }: AppShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top App Bar */}
      <header className="bg-accent text-white" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 md:px-8">
          <Link
            className="flex items-center gap-2.5 text-white/90 transition hover:text-white"
            href="/"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="TSS Takip"
              className="size-8 rounded-md"
              src="/icon.svg"
            />
            <span className="hidden text-sm font-semibold tracking-wide sm:block">
              TSS Takip
            </span>
          </Link>

          <div className="flex-1">
            <h1 className="text-lg font-semibold leading-tight">{title}</h1>
            {subtitle ? (
              <p className="hidden text-xs text-white/70 sm:block">{subtitle}</p>
            ) : null}
          </div>

          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          <SignOutButton />
        </div>

        {/* Navigation tabs */}
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <nav className="flex gap-1 overflow-x-auto pb-0">
            {nav.map((item) => (
              <Link
                className="whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/50 hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">{children}</div>
    </main>
  );
}

export const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/services", label: "Servisler" },
  { href: "/admin/services/new", label: "Yeni Servis" },
  { href: "/admin/members", label: "Üyeler" },
  { href: "/admin/settings", label: "Ayarlar" },
];

export const memberNav = [
  { href: "/member", label: "Servislerim" },
  { href: "/member/services/new", label: "Yeni Servis Kaydı" },
];
