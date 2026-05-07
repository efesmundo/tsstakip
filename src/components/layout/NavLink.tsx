"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/admin" && href !== "/member" && pathname.startsWith(href));

  return (
    <Link
      className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
        isActive ? "text-white" : "text-white/65 hover:text-white"
      }`}
      href={href}
      prefetch
    >
      {children}
      <span
        className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-white transition-all duration-200 ${
          isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-50"
        }`}
      />
    </Link>
  );
}
