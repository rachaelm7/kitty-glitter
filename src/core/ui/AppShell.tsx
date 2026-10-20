"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MODULES } from "@/config/modules";
import { Icon } from "./icons";
import { cx } from "./primitives";

const TABS = [
  { href: "/", label: "Today", icon: Icon.Today },
  { href: "/inbox", label: "Inbox", icon: Icon.Inbox },
  { href: "/tasks", label: "Tasks", icon: Icon.Tasks },
  { href: "/more", label: "More", icon: Icon.More },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children, extras }: { children: ReactNode; extras?: ReactNode }) {
  const pathname = usePathname();
  const tabHrefs = new Set<string>(TABS.map((t) => t.href));
  const moduleLinks = MODULES.filter((m) => m.status === "live" && m.href && !tabHrefs.has(m.href));
  const onModulePage = moduleLinks.some((m) => isActive(pathname, m.href!));

  return (
    <div className="lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>

      {/* Desktop side navigation */}
      <nav aria-label="Main" className="sticky top-0 hidden h-dvh w-64 flex-none flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-accent font-display text-lg font-semibold text-accent-ink">K</span>
          <span className="font-display text-xl font-semibold">Kitty Glitter</span>
        </Link>
        <ul className="space-y-1">
          {TABS.map((t) => (
            <li key={t.href}>
              <NavLink href={t.href} active={isActive(pathname, t.href) && !(t.href === "/more" && onModulePage)} icon={<t.icon />}>
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
        {moduleLinks.length > 0 && (
          <>
            <p className="mt-8 mb-2 px-3 text-xs font-semibold tracking-wide text-muted uppercase">Modules</p>
            <ul className="space-y-1">
              {moduleLinks.map((m) => {
                const I = Icon[m.icon];
                return (
                  <li key={m.key}>
                    <NavLink href={m.href!} active={isActive(pathname, m.href!)} icon={<I />}>
                      {m.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <p className="mt-auto px-3 text-xs text-muted">Demo with fictional data. Nothing is connected to real accounts.</p>
      </nav>

      <div className="min-w-0 flex-1">
        <main id="main" className="mx-auto w-full max-w-[1040px] px-4 pt-[calc(20px+env(safe-area-inset-top,0px))] pb-[calc(112px+env(safe-area-inset-bottom,0px))] sm:px-6 lg:px-10 lg:pt-10 lg:pb-16">
          {children}
        </main>
      </div>

      {extras}

      {/* Phone tab bar */}
      <nav aria-label="Tabs" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 px-2.5 pt-1.5 pb-[calc(8px+env(safe-area-inset-bottom,0px))] backdrop-blur lg:hidden">
        <ul className="mx-auto flex max-w-xl">
          {TABS.map((t) => {
            const active = isActive(pathname, t.href) || (t.href === "/more" && onModulePage);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-semibold",
                    active ? "text-accent" : "text-muted",
                  )}
                >
                  <t.icon strokeWidth={active ? 2.3 : 1.8} />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function NavLink({ href, active, icon, children }: { href: string; active: boolean; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cx(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors",
        active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      {icon}
      <span className="truncate">{children}</span>
    </Link>
  );
}
