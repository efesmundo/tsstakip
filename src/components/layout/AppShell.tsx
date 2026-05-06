import Link from "next/link";

import { SignOutButton } from "@/components/auth/SignOutButton";

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  title: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, nav, children }: AppShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-panel">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <Link className="text-sm font-semibold text-accent-strong" href="/">
              TSS Takip
            </Link>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-foreground/65">{subtitle}</p>
          </div>
          <SignOutButton />
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 pb-4 md:px-8">
          {nav.map((item) => (
            <Link
              className="whitespace-nowrap rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-panel-muted"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
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
