"use client";

import Link from "next/link";
import { DEMO_USER_NAME } from "@/config/demo";
import { addDays, formatDay, formatLongDate, greeting, untilLabel, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Card, CheckCircle, DemoBadge, PageHeader, Section, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { AccountDot, emailProvider, promoTotal } from "@/modules/email";
import { AGENDA, formatTime } from "@/modules/calendar";
import { RENEWALS } from "@/modules/bills";
import { composeBrief, type NeedItem } from "../data/brief";
import { needsDoneStore } from "../data/store";

const MAX_NEEDS = 3;

export function TodayScreen() {
  const now = useNow();
  const done = useStore(needsDoneStore);
  const messages = emailProvider.listMessages();
  const accounts = emailProvider.listAccounts();
  const promos = emailProvider.listPromoSenders();

  const needs: NeedItem[] = messages
    .filter((m) => m.urgent)
    .slice(0, MAX_NEEDS)
    .map((m) => ({ id: m.id, title: m.actionTitle ?? m.subject, who: m.from, when: m.deadline?.label ?? "Soon" }));
  const openNeeds = needs.filter((n) => !done[n.id]);

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  let currentIdx = -1;
  AGENDA.forEach((a, i) => {
    if (a.hour * 60 + a.minute <= minutesNow) currentIdx = i;
  });
  const maxUnread = Math.max(...accounts.map((a) => a.unread));
  const upcoming = [...RENEWALS].sort((a, b) => a.dayOffset - b.dayOffset);

  return (
    <div>
      <PageHeader title={`${greeting(now)}, ${DEMO_USER_NAME}`} subtitle={formatLongDate(now)}>
        <div className="mt-3">
          <DemoBadge />
        </div>
      </PageHeader>

      <div className="mt-6 rounded-3xl bg-accent p-5 text-accent-ink animate-rise">
        <p className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
          <Icon.Sparkle width={16} height={16} /> Morning brief
        </p>
        <p className="mt-1.5 text-[17px] leading-relaxed">{composeBrief(openNeeds, AGENDA.length)}</p>
        <p className="mt-2.5 text-[13px] opacity-80">Simulated AI brief from fictional sample mail.</p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
        <div>
          <Section title="Needs you" id="needs" action={<span className="text-sm text-muted">{openNeeds.length} of {needs.length} left</span>}>
            <ul className="space-y-2.5">
              {needs.map((n) => {
                const checked = !!done[n.id];
                return (
                  <li
                    key={n.id}
                    className={cx(
                      "flex items-start gap-3 rounded-2xl border-l-[5px] p-3.5 transition-colors",
                      checked ? "border-l-line bg-transparent opacity-60" : "border-l-urgent bg-urgent-soft",
                    )}
                  >
                    <CheckCircle
                      tone="urgent"
                      checked={checked}
                      onToggle={() => needsDoneStore.set((d) => ({ ...d, [n.id]: !checked }))}
                      label={`${checked ? "Mark not done" : "Mark done"}: ${n.title}`}
                    />
                    <div className="min-w-0">
                      <p className={cx("text-[13px] font-semibold", checked ? "text-muted" : "text-urgent")}>{n.when}</p>
                      <p className={cx("font-semibold", checked && "line-through")}>{n.title}</p>
                      <p className="text-sm text-muted">{n.who}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title="Today" id="agenda">
            <Card className="py-1">
              <ol>
                {AGENDA.map((a, i) => (
                  <li
                    key={a.id}
                    aria-current={i === currentIdx ? "time" : undefined}
                    className={cx("grid grid-cols-[76px_1fr] gap-2 border-b border-line py-3 last:border-b-0", i < currentIdx && "opacity-50")}
                  >
                    <span className={cx("pt-px text-sm", i === currentIdx ? "font-bold text-accent" : "text-muted")}>{formatTime(a.hour, a.minute)}</span>
                    <span>
                      <b className="font-semibold">{a.title}</b>
                      {a.where && <span className="block text-sm text-muted">{a.where}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          </Section>
        </div>

        <div>
          <Section title="Unread by account" id="unread">
            <Card>
              <ul className="space-y-3">
                {accounts.map((a) => (
                  <li key={a.id} className="grid grid-cols-[minmax(0,120px)_1fr_40px] items-center gap-3 text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <AccountDot account={a.id} /> {a.name}
                    </span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                      <span className="block h-full rounded-full" style={{ width: `${Math.round((a.unread / maxUnread) * 100)}%`, background: a.color }} />
                    </span>
                    <span className="text-right text-muted">
                      {a.unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="mt-3 flex items-center justify-between gap-3">
              <p>
                <b className="font-semibold">{promoTotal(promos)} promotional emails</b>
                <span className="block text-sm text-muted">from {promos.length} senders, ready to review</span>
              </p>
              <Link href="/inbox/cleanup" className="inline-flex min-h-11 flex-none items-center rounded-xl bg-accent px-4 font-semibold text-accent-ink">
                Review
              </Link>
            </Card>
          </Section>

          <Section title="Coming up" id="upcoming">
            <Card className="py-1">
              <ul>
                {upcoming.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-b-0">
                    <span className="min-w-0">
                      <span className="block truncate">{r.title}</span>
                      {r.amount && <span className="text-sm text-muted">{r.amount}</span>}
                    </span>
                    <span className="flex flex-none flex-col items-end">
                      <b className="font-semibold">{formatDay(addDays(now, r.dayOffset))}</b>
                      <Tag tone={r.dayOffset <= 7 ? "urgent" : "neutral"}>{untilLabel(r.dayOffset)}</Tag>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        </div>
      </div>
    </div>
  );
}

