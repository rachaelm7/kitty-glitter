"use client";

import Link from "next/link";
import { Card } from "@/core/ui/primitives";
import { AccountDot, emailProvider, promoTotal } from "@/modules/email";
import { Frame } from "./Frame";

export function UnreadWidget() {
  const accounts = emailProvider.listAccounts();
  const max = Math.max(...accounts.map((a) => a.unread));
  return (
    <Frame id="unread" title="Unread by account" href="/inbox">
      <Card>
        <ul className="space-y-3">
          {accounts.map((a) => (
            <li key={a.id} className="grid grid-cols-[minmax(0,120px)_1fr_40px] items-center gap-3 text-sm">
              <span className="flex items-center gap-2 truncate">
                <AccountDot account={a.id} /> {a.name}
              </span>
              <span className="h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                <span className="block h-full rounded-full" style={{ width: `${Math.round((a.unread / max) * 100)}%`, background: a.color }} />
              </span>
              <span className="text-right text-muted">
                {a.unread}
                <span className="sr-only"> unread</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </Frame>
  );
}

export function PromosWidget() {
  const promos = emailProvider.listPromoSenders();
  return (
    <Frame id="promos" title="Promotions">
      <Card className="flex items-center justify-between gap-3">
        <p>
          <b className="font-semibold">{promoTotal(promos)} promotional emails</b>
          <span className="block text-sm text-muted">from {promos.length} senders, ready to review</span>
        </p>
        <Link href="/inbox/cleanup" className="inline-flex min-h-11 flex-none items-center rounded-xl bg-accent px-4 font-semibold text-accent-ink">
          Review
        </Link>
      </Card>
    </Frame>
  );
}
