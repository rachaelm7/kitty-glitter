"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDays, formatDay, relativeDay, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { requestOpen } from "@/core/store/intent";
import { Card, CheckCircle, EmptyState, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { STATUS_LABEL, appointmentStore, needsAttention, nextActions } from "@/modules/appointments";
import { AccountDot, emailProvider, inboxStateStore, isUnread, markRead } from "@/modules/email";
import { StagePill, deriveThreadState } from "@/modules/hub";
import { dueOffset, taskStore, toggleTask, viewTasks } from "@/modules/tasks";
import { threadStore } from "@/modules/threads";
import { Frame } from "./Frame";

export function AppointmentsWidget() {
  const now = useNow();
  const list = useStore(appointmentStore).filter((a) => a.status !== "completed");
  const scheduled = list.filter((a) => a.when && a.when.dayOffset >= 0).sort((a, b) => a.when!.dayOffset - b.when!.dayOffset);
  const flagged = list.filter((a) => needsAttention(a) && !scheduled.includes(a));
  const shown = [...scheduled, ...flagged].slice(0, 3);
  return (
    <Frame id="appointments" title="Upcoming appointments" href="/appointments">
      {shown.length === 0 ? (
        <EmptyState title="Nothing booked" icon={<Icon.Calendar />} />
      ) : (
        <Card className="py-1">
          <ul>
            {shown.map((a) => (
              <li key={a.id} className="border-b border-line last:border-b-0">
                <Link href="/appointments" className="flex items-start gap-3 py-3">
                  <span className="grid w-12 flex-none place-items-center rounded-2xl bg-lavender-soft py-1.5 text-center text-lavender">
                    {a.when ? (
                      <>
                        <span className="text-[11px] font-bold uppercase">{addDays(now, a.when.dayOffset).toLocaleDateString("en-US", { month: "short" })}</span>
                        <span className="font-display text-lg leading-none font-semibold">{addDays(now, a.when.dayOffset).getDate()}</span>
                      </>
                    ) : (
                      <Icon.Clock width={20} height={20} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <b className="font-semibold">{a.title}</b>
                      <Tag tone={needsAttention(a) ? "urgent" : "lavender"}>{STATUS_LABEL[a.status]}</Tag>
                    </span>
                    <span className="block text-sm text-muted">{a.when ? `${relativeDay(a.when.dayOffset, now)}, ${a.when.time} · ${a.provider}` : nextActions(a)[0]?.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="border-t border-line py-2.5 text-xs text-muted">Fictional demo. Not medical advice.</p>
        </Card>
      )}
    </Frame>
  );
}

export function TasksWidget() {
  const now = useNow();
  const tasks = useStore(taskStore);
  const today = viewTasks(tasks, "today", now);
  const waiting = viewTasks(tasks, "waiting", now);
  const soon = viewTasks(tasks, "upcoming", now).filter((t) => (dueOffset(t, now) ?? 99) <= 3);
  const shown = [...today, ...soon].slice(0, 4);
  return (
    <Frame id="tasks" title="Tasks needing attention" href="/tasks">
      <Card className="py-1">
        {shown.length === 0 ? (
          <p className="py-3 text-sm text-muted">Nothing due in the next few days.</p>
        ) : (
          <ul>
            {shown.map((t) => {
              const off = dueOffset(t, now);
              return (
                <li key={t.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                  <CheckCircle checked={t.status === "done"} onToggle={() => toggleTask(t.id)} label={`Done: ${t.title}`} />
                  <Link href="/tasks" onClick={() => requestOpen({ task: t.id })} className="min-w-0 flex-1 hover:underline">
                    {t.title}
                  </Link>
                  {off !== undefined && <Tag tone={off < 0 ? "urgent" : off === 0 ? "accent" : "champagne"}>{off <= 0 ? (off < 0 ? "Overdue" : "Today") : relativeDay(off, now)}</Tag>}
                </li>
              );
            })}
          </ul>
        )}
        {waiting.length > 0 && (
          <Link href="/tasks" className="flex items-center gap-1.5 border-t border-line py-2.5 text-sm text-lavender hover:underline">
            <Icon.Clock width={16} height={16} /> Waiting on others: {waiting.length}
          </Link>
        )}
      </Card>
    </Frame>
  );
}

export function EmailWidget() {
  const router = useRouter();
  const state = useStore(inboxStateStore);
  const list = emailProvider
    .listMessages()
    .filter((m) => m.needsAction && !m.urgent && !state.archived[m.id])
    .slice(0, 3);
  return (
    <Frame id="email" title="Important email" href="/inbox">
      <Card className="py-1">
        <ul>
          {list.map((m) => (
            <li key={m.id} className="border-b border-line last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  markRead(m.id);
                  requestOpen({ email: m.id });
                  router.push("/inbox");
                }}
                className="block w-full py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm">
                  {isUnread(m, state) && (
                    <>
                      <span aria-hidden className="size-2 rounded-full bg-ink" />
                      <span className="sr-only">Unread: </span>
                    </>
                  )}
                  <AccountDot account={m.account} />
                  <span className={cx("truncate", isUnread(m, state) ? "font-bold" : "text-muted")}>{m.from}</span>
                </span>
                <span className="mt-0.5 block font-semibold">{m.subject}</span>
                <span className="block truncate text-sm text-muted">{m.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </Frame>
  );
}

export function ThreadsWidget() {
  const now = useNow();
  const tasks = useStore(taskStore);
  const threads = useStore(threadStore)
    .filter((t) => t.stage !== "done")
    .sort((a, b) => ["action", "waiting", "scheduled"].indexOf(a.stage) - ["action", "waiting", "scheduled"].indexOf(b.stage))
    .slice(0, 4);
  return (
    <Frame id="threads" title="Life Threads" href="/threads">
      <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {threads.map((t) => {
          const I = Icon[t.icon];
          const st = deriveThreadState(t, tasks, now);
          return (
            <li key={t.id}>
              <Link href={`/threads/${t.id}`} className="flex h-full items-start gap-3 rounded-[22px] border border-line/70 bg-surface p-3.5 shadow-soft transition-shadow hover:shadow-lift">
                <span className="grid size-9 flex-none place-items-center rounded-xl" style={{ background: `${t.color}1f`, color: t.color }}>
                  <I width={18} height={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <b className="text-[15px] leading-snug font-semibold">{t.name}</b>
                    <StagePill stage={t.stage} />
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{st.allDone ? "All caught up. Ready to wrap up?" : st.next && !st.next.waiting ? `Next: ${st.next.label}` : st.waitingOn ? `Waiting on ${st.waitingOn}` : st.status}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

export function NextDate({ offset }: { offset: number }) {
  const now = useNow();
  return <>{formatDay(addDays(now, offset))}</>;
}
