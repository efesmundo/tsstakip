import Link from "next/link";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { NavLink } from "@/components/layout/NavLink";

export type NavItem = {
  href: string;
  label: string;
};

type AppHeaderProps = {
  nav: NavItem[];
};

export function AppHeader({ nav }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-accent text-white" style={{ boxShadow: "var(--shadow-md)" }}>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 md:px-8">
        <Link
          className="flex items-center gap-2.5 text-white/90 transition hover:text-white"
          href="/"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="TSS Takip" className="size-8 rounded-md" src="/icon.svg" />
          <span className="hidden text-sm font-semibold tracking-wide sm:block">
            TSS Takip
          </span>
        </Link>

        <div className="flex-1" />

        <SignOutButton />
      </div>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <nav className="flex gap-1 overflow-x-auto">
          {nav.map((item) => (
            <NavLink href={item.href} key={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-foreground/60">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/services", label: "Servisler" },
  { href: "/admin/services/new", label: "Yeni Servis" },
  { href: "/admin/reports", label: "Raporlar" },
  { href: "/admin/members", label: "Üyeler" },
  { href: "/admin/settings", label: "Ayarlar" },
];

export const memberNav: NavItem[] = [
  { href: "/member", label: "Servislerim" },
  { href: "/member/services/new", label: "Yeni Servis Kaydı" },
];
