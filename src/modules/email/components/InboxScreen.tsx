"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { clearIntent, intentStore } from "@/core/store/intent";
import { Button, Chip, EmptyState, PageHeader, SkeletonRows, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { addTask } from "@/modules/tasks";
import { mockEmailProvider } from "../data/mock";
import { TABS, filterMessages, groupNewsletters, isUnread, promoTotal, tabCounts, type InboxTab } from "../data/logic";
import { inboxStateStore, markRead, setArchived } from "../data/store";
import type { AccountId, Message } from "../data/types";
import { AccountDot } from "./AccountDot";
import { MessageRow } from "./MessageRow";
import { MessageSheet } from "./MessageSheet";

export function InboxScreen() {
  const now = useNow();
  const toast = useToast();
  const router = useRouter();
  const accounts = mockEmailProvider.listAccounts();
  const all = mockEmailProvider.listMessages();
  const state = useStore(inboxStateStore);
  const intent = useStore(intentStore);
  const [account, setAccount] = useState<AccountId | "all">("all");
  const [tab, setTab] = useState<InboxTab>("all");
  const [query, setQuery] = useState("");
  const [localOpen, setLocalOpen] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const list = useMemo(() => filterMessages(all, { account, tab, query, state, showArchived }), [all, account, tab, query, state, showArchived]);
  const rows = showArchived || query ? list.map((message) => ({ kind: "message" as const, message })) : groupNewsletters(list);
  const counts = tabCounts(all, state, account);
  const archivedCount = Object.keys(state.archived).length;
  const totalUnread = accounts.reduce((n, a) => n + a.unread, 0);
  const openId = intent.email ?? localOpen;
  const open = all.find((m) => m.id === openId) ?? null;

  function openMessage(m: Message) {
    markRead(m.id);
    setLocalOpen(m.id);
  }

  function archive(m: Message) {
    const was = !!state.archived[m.id];
    setArchived(m.id, !was);
    toast(was ? "Moved back to inbox" : "Archived (demo only)", { label: "Undo", onClick: () => setArchived(m.id, was) });
  }

  function makeTask(m: Message) {
    addTask({ title: m.actionTitle ?? m.subject, emailId: m.id, emailFrom: m.from, threadId: m.threadId, category: categoryFor(m), dueDayOffset: m.deadline?.dayOffset });
    toast("Task added, linked to this email", { label: "Open Tasks", onClick: () => router.push("/tasks") });
  }

  return (
    <div>
      <PageHeader title="Inbox" subtitle={`${totalUnread} unread across five fictional accounts`}>
        <Button
          size="sm"
          variant="quiet"
          className="mt-2 -ml-3"
          disabled={refreshing}
          onClick={() => {
            setRefreshing(true);
            setTimeout(() => {
              setRefreshing(false);
              toast("You're up to date (demo: nothing is fetched)");
            }, 900);
          }}
        >
          {refreshing ? "Checking…" : "Check for new mail"}
        </Button>
      </PageHeader>

      <Link
        href="/inbox/rescue"
        className="mt-3 flex items-center gap-3 rounded-[22px] border border-line/70 bg-lavender-soft p-3.5 transition-colors hover:brightness-[0.98]"
      >
        <span className="grid size-10 flex-none place-items-center rounded-xl bg-surface text-lavender">
          <Icon.Lifebuoy />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block font-semibold">Feeling buried? Try Rescue Mode</b>
          <span className="block text-sm text-muted">Sort {totalUnread} unread into calm piles. Important mail is protected.</span>
        </span>
        <Icon.Chevron className="flex-none text-muted" width={20} height={20} />
      </Link>

      <div className="relative mt-4">
        <Icon.Search className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" width={20} height={20} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search senders, subjects and addresses"
          aria-label="Search every account"
          className="min-h-12 w-full rounded-2xl border-[1.5px] border-line bg-surface pr-4 pl-11 shadow-soft"
        />
      </div>

      <div role="tablist" aria-label="Category" className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "flex min-h-10 flex-none items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-ink text-bg" : "bg-surface text-muted shadow-soft hover:text-ink",
            )}
          >
            {t.label}
            {counts[t.id] > 0 && (
              <span className={cx("rounded-full px-1.5 text-xs", tab === t.id ? "bg-bg/20" : t.id === "action" ? "bg-urgent-soft text-urgent" : "bg-surface-2")}>{counts[t.id]}</span>
            )}
          </button>
        ))}
      </div>

      <div role="group" aria-label="Filter by account" className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
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

      {tab === "promotions" && !showArchived && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line/70 bg-champagne-soft p-4">
          <p className="min-w-0">
            <b className="block font-semibold">Bulk cleanup preview</b>
            <span className="text-sm text-muted">
              {promoTotal(mockEmailProvider.listPromoSenders())} older promotions from {mockEmailProvider.listPromoSenders().length} senders. Choose per sender, review, then confirm.
            </span>
          </p>
          <Link href="/inbox/cleanup" className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 font-semibold text-accent-ink">
            Preview cleanup
          </Link>
        </div>
      )}

      {showArchived && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-lavender-soft px-4 py-2.5 text-sm">
          <span>
            <b className="font-semibold">Archived (demo)</b>: only hidden in this demo, never removed from a mailbox.
          </span>
          <Button size="sm" variant="quiet" onClick={() => setShowArchived(false)}>
            Back to inbox
          </Button>
        </div>
      )}

      {refreshing ? (
        <div className="mt-3">
          <SkeletonRows rows={4} />
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={query ? "No matches" : showArchived ? "Nothing archived" : "All clear"}>
            {query ? (
              <>
                Nothing matches “{query}”.{" "}
                <Button variant="quiet" size="sm" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </>
            ) : showArchived ? (
              "Archived demo emails show up here so you can move them back."
            ) : (
              "Nothing here right now. That's a good thing."
            )}
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-[22px] border border-line/70 bg-surface shadow-soft">
          {rows.map((r) =>
            r.kind === "message" ? (
              <MessageRow
                key={r.message.id}
                message={r.message}
                unread={isUnread(r.message, state)}
                archived={!!state.archived[r.message.id]}
                now={now}
                onOpen={() => openMessage(r.message)}
                onArchive={() => archive(r.message)}
              />
            ) : (
              <li key="newsletters" className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  aria-expanded={newsOpen}
                  onClick={() => setNewsOpen((o) => !o)}
                  className="flex w-full items-center gap-3 px-3 py-3.5 text-left hover:bg-surface-2/50"
                >
                  <span className="grid size-9 flex-none place-items-center rounded-xl bg-lavender-soft text-lavender">
                    <Icon.Mail width={18} height={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block font-semibold">
                      Newsletters <span className="font-normal text-muted">· {r.messages.length}</span>
                    </b>
                    <span className="block truncate text-sm text-muted">{r.messages.map((m) => m.from).join(", ")}</span>
                  </span>
                  <Icon.Down width={18} height={18} className={cx("flex-none text-muted transition-transform", newsOpen && "rotate-180")} />
                </button>
                {newsOpen && (
                  <ul className="border-t border-line bg-surface-2/40 pl-3">
                    {r.messages.map((m) => (
                      <MessageRow
                        key={m.id}
                        message={m}
                        unread={isUnread(m, state)}
                        now={now}
                        onOpen={() => openMessage(m)}
                        onArchive={() => archive(m)}
                      />
                    ))}
                  </ul>
                )}
              </li>
            ),
          )}
        </ul>
      )}

      {!showArchived && archivedCount > 0 && (
        <div className="mt-3 text-center">
          <Button size="sm" variant="quiet" onClick={() => setShowArchived(true)}>
            <Icon.Archive width={16} height={16} /> View archived ({archivedCount})
          </Button>
        </div>
      )}

      <MessageSheet
        message={open}
        unread={open ? isUnread(open, state) : false}
        archived={open ? !!state.archived[open.id] : false}
        onClose={() => {
          setLocalOpen(null);
          clearIntent("email");
        }}
        onMakeTask={makeTask}
      />
    </div>
  );
}

function categoryFor(m: Message) {
  if (m.category === "appointment") return "Health" as const;
  if (m.category === "bill" || m.category === "renewal") return "Money" as const;
  if (m.category === "service") return "Home" as const;
  if (m.category === "work") return "Work" as const;
  if (m.category === "personal") return "Social" as const;
  return "Errands" as const;
}
