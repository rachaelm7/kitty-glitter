"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Button, Chip, EmptyState, PageHeader, Segmented } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { mockEmailProvider } from "../data/mock";
import { filterMessages, toProposals, type InboxView } from "../data/logic";
import { cleanupStore } from "../data/store";
import type { AccountId } from "../data/types";
import { AccountDot } from "./AccountDot";
import { CleanupChooser } from "./CleanupChooser";
import { MessageRow } from "./MessageRow";
import { MessageSheet } from "./MessageSheet";

export function InboxScreen({ initialView = "priority" }: { initialView?: InboxView }) {
  const now = useNow();
  const accounts = mockEmailProvider.listAccounts();
  const all = mockEmailProvider.listMessages();
  const [account, setAccount] = useState<AccountId | "all">("all");
  const [view, setView] = useState<InboxView>(initialView);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const choices = useStore(cleanupStore);
  const selected = toProposals(choices).length;

  const list = useMemo(() => filterMessages(all, { account, view, query }), [all, account, view, query]);
  const open = all.find((m) => m.id === openId) ?? null;
  const totalUnread = accounts.reduce((n, a) => n + a.unread, 0);
  const priorityCount = filterMessages(all, { account, view: "priority", query: "" }).length;

  return (
    <div>
      <PageHeader title="Inbox" subtitle="All five accounts in one calm place" />

      {totalUnread > 100 && (
        <Link
          href="/inbox/rescue"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 transition-colors hover:bg-surface-2"
        >
          <span className="grid size-10 flex-none place-items-center rounded-xl bg-accent-soft text-accent">
            <Icon.Lifebuoy />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block font-semibold">{totalUnread} unread? Try Rescue Mode</b>
            <span className="block text-sm text-muted">Sort the pile in calm steps. Important mail is protected.</span>
          </span>
          <Icon.Chevron className="flex-none text-muted" width={20} height={20} />
        </Link>
      )}

      <div className="relative mt-5">
        <Icon.Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" width={20} height={20} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (view === "cleanup") setView("everything");
          }}
          placeholder="Search every account"
          aria-label="Search every account"
          className="min-h-12 w-full rounded-2xl border-[1.5px] border-line bg-surface pr-4 pl-11"
        />
      </div>

      <div role="group" aria-label="Filter by account" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip pressed={account === "all"} onClick={() => setAccount("all")}>
          All accounts
        </Chip>
        {accounts.map((a) => (
          <Chip key={a.id} pressed={account === a.id} onClick={() => setAccount(a.id)}>
            <AccountDot account={a.id} />
            {a.name}
          </Chip>
        ))}
      </div>

      <div className="mt-3">
        <Segmented
          label="Inbox view"
          value={view}
          onChange={setView}
          options={[
            { value: "priority", label: "Priority", count: priorityCount },
            { value: "everything", label: "Everything" },
            { value: "cleanup", label: "Cleanup" },
          ]}
        />
      </div>

      {view === "cleanup" ? (
        <>
          <CleanupChooser />
          {selected > 0 && (
            <div className="sticky bottom-[calc(92px+env(safe-area-inset-bottom,0px))] z-10 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-bg lg:bottom-6">
              <span>
                {selected} sender{selected > 1 ? "s" : ""} selected
              </span>
              <Link href="/inbox/cleanup/review" className="inline-flex min-h-11 items-center rounded-xl bg-bg px-4 font-semibold text-ink">
                Review
              </Link>
            </div>
          )}
        </>
      ) : list.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={query ? "No matches" : "All clear"}>
            {query ? (
              <>
                Nothing matches “{query}”.{" "}
                <Button variant="quiet" size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </>
            ) : (
              "Nothing needs you here. That's a good thing."
            )}
          </EmptyState>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-line bg-surface px-3">
          {list.map((m) => (
            <MessageRow key={m.id} message={m} now={now} onOpen={() => setOpenId(m.id)} />
          ))}
        </div>
      )}

      <MessageSheet message={open} onClose={() => setOpenId(null)} />
    </div>
  );
}
