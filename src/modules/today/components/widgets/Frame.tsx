import Link from "next/link";
import type { ReactNode } from "react";

export function Frame({ id, title, action, href, children }: { id: string; title: string; action?: ReactNode; href?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`w-${id}`}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id={`w-${id}`} className="text-[21px] leading-tight">
          {title}
        </h2>
        {action}
        {href && !action && (
          <Link href={href} className="text-sm font-semibold text-accent hover:underline">
            Open
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
