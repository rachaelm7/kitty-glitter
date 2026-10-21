"use client";

import Link from "next/link";
import { useStore } from "@/core/store/createStore";
import { PageHeader } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { mockEmailProvider } from "../data/mock";
import { promoTotal, toProposals } from "../data/logic";
import { cleanupStore } from "../data/store";
import { CleanupChooser } from "./CleanupChooser";

export function CleanupScreen() {
  const selected = toProposals(useStore(cleanupStore)).length;
  const senders = mockEmailProvider.listPromoSenders();
  return (
    <div>
      <Link href="/inbox" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent">
        <Icon.Back width={20} height={20} /> Inbox
      </Link>
      <PageHeader title="Promotions to review" subtitle={`${promoTotal(senders)} emails from ${senders.length} senders`} />
      <CleanupChooser />
      <div className="sticky bottom-[calc(92px+env(safe-area-inset-bottom,0px))] z-10 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-bg lg:bottom-6">
        <span>{selected ? `${selected} sender${selected > 1 ? "s" : ""} selected` : "Choose an action above"}</span>
        <Link
          href="/inbox/cleanup/review"
          aria-disabled={selected === 0}
          className={"inline-flex min-h-11 items-center rounded-xl bg-bg px-4 font-semibold text-ink " + (selected === 0 ? "pointer-events-none opacity-50" : "")}
        >
          Review
        </Link>
      </div>
    </div>
  );
}
