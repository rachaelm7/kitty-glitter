"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/core/store/createStore";
import { Button, Card, EmptyState, PageHeader } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { mockEmailProvider } from "../data/mock";
import { toProposals } from "../data/logic";
import { cleanupStore } from "../data/store";
import { AccountDot } from "./AccountDot";

const LABEL = { unsubscribe: "Unsubscribe", spam: "Mark as spam" } as const;

export function CleanupReview() {
  const choices = useStore(cleanupStore);
  const proposals = toProposals(choices);
  const senders = mockEmailProvider.listPromoSenders();
  const [done, setDone] = useState<{ senders: number; emails: number } | null>(null);

  if (done) {
    return (
      <div>
        <PageHeader title="Done (simulated)" />
        <Card className="mt-6">
          <p className="flex items-center gap-2 font-semibold text-accent">
            <Icon.Shield /> No real emails were changed
          </p>
          <p className="mt-2">
            In the full app this would have handled {done.senders} sender{done.senders > 1 ? "s" : ""} and {done.emails} emails, and anything moved
            would stay recoverable for 30 days.
          </p>
          <Link href="/inbox" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 font-semibold text-accent-ink">
            Back to Inbox
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Link href="/inbox/cleanup" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent">
        <Icon.Back width={20} height={20} /> Promotions
      </Link>
      <PageHeader title="Review cleanup" subtitle="Nothing happens until you confirm." />

      {proposals.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Nothing selected">
            Choose Unsubscribe or Mark spam for a sender in Inbox → Cleanup, then come back here.
          </EmptyState>
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-line rounded-[22px] border border-line/70 bg-surface shadow-soft px-4">
            {proposals.map((p) => {
              const s = senders.find((x) => x.id === p.senderId)!;
              return (
                <li key={p.senderId} className="flex items-center justify-between gap-3 py-3.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <AccountDot account={s.account} />
                    <span className="truncate font-semibold">{s.name}</span>
                  </span>
                  <span className={p.choice === "spam" ? "text-right text-sm font-semibold text-urgent" : "text-right text-sm font-semibold"}>
                    {LABEL[p.choice]} · {s.count} emails
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Important mail (bills, appointments, security and people you write to) is never included in cleanup.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                setDone(mockEmailProvider.previewCleanup(proposals));
                cleanupStore.reset();
              }}
            >
              Confirm
            </Button>
            <Link href="/inbox/cleanup" className="inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-line bg-surface px-4 font-semibold">
              Go back
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-muted">Demo only: confirming changes nothing in any mailbox.</p>
        </>
      )}
    </div>
  );
}
