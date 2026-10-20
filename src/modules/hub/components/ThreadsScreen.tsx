"use client";

import Link from "next/link";
import { useNow, untilLabel } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Card, EmptyState, PageHeader, Tag } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { STATUS_LABEL, appointmentStore } from "@/modules/appointments";
import { RENEWALS } from "@/modules/bills";
import { coverage, maintenanceStore, nextDue } from "@/modules/home";
import { packingProgress, tripStore } from "@/modules/travel";
import { emailProvider } from "@/modules/email";
import { sortTasks, taskStore } from "@/modules/tasks";
import { threadNoteStore, threadStore } from "@/modules/threads";

/** Life Threads: everything related to one part of life, gathered from every module. */
export function ThreadsScreen() {
  useNow();
  const threads = useStore(threadStore);
  const tasks = sortTasks(useStore(taskStore));
  const notes = useStore(threadNoteStore);
  const messages = emailProvider.listMessages();
  const appts = useStore(appointmentStore);
  const trips = useStore(tripStore);
  const upkeep = useStore(maintenanceStore);

  return (
    <div>
      <PageHeader title="Life Threads" subtitle="Related tasks, emails, notes and dates, gathered in one place." />
      {threads.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No threads yet" icon={<Icon.Thread />}>
            Create one from a brain dump.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {threads.map((t) => {
            const tTasks = tasks.filter((k) => k.threadId === t.id);
            const tMail = messages.filter((m) => m.threadId === t.id);
            const tDates = RENEWALS.filter((r) => r.threadId === t.id);
            const tNotes = notes.filter((n) => n.threadId === t.id);
            const tAppts = appts.filter((a) => a.threadId === t.id);
            const tTrips = trips.filter((x) => x.threadId === t.id);
            const tUpkeep = upkeep.filter((m) => m.threadId === t.id);
            const tCover = coverage.filter((c) => c.threadId === t.id);
            const empty = !tTasks.length && !tMail.length && !tDates.length && !tNotes.length && !tAppts.length && !tTrips.length && !tUpkeep.length && !tCover.length;
            return (
              <li key={t.id} id={t.id} className="scroll-mt-6 target:[&>div]:ring-2 target:[&>div]:ring-accent">
                <Card className="h-full">
                  <div className="flex items-center gap-2.5">
                    <span className="grid size-9 place-items-center rounded-xl" style={{ background: `${t.color}22`, color: t.color }}>
                      <Icon.Thread width={20} height={20} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg leading-tight">{t.name}</h2>
                      <p className="truncate text-sm text-muted">{t.blurb}</p>
                    </div>
                  </div>
                  {empty && <p className="mt-3 text-sm text-muted">Nothing linked yet.</p>}
                  {tTasks.length > 0 && (
                    <Group label="Tasks">
                      {tTasks.map((k) => (
                        <li key={k.id} className={k.done ? "text-muted line-through" : ""}>
                          {k.title} {k.kind === "reminder" && <Tag tone="neutral">Reminder</Tag>}
                        </li>
                      ))}
                    </Group>
                  )}
                  {tTrips.length > 0 && (
                    <Group label="Trips">
                      {tTrips.map((x) => (
                        <li key={x.id}>
                          <Link href="/travel" className="hover:underline">
                            {x.name}
                          </Link>{" "}
                          <Tag tone="neutral">leaves {untilLabel(x.startOffset)}</Tag>{" "}
                          <span className="text-muted">· {x.reservations.length} bookings · {packingProgress(x.packing).pct}% packed</span>
                        </li>
                      ))}
                    </Group>
                  )}
                  {(tUpkeep.length > 0 || tCover.length > 0) && (
                    <Group label="Home & coverage">
                      {tUpkeep.map((m) => (
                        <li key={m.id}>
                          <Link href="/home" className="hover:underline">
                            {m.title}
                          </Link>{" "}
                          <Tag tone={nextDue(m).state === "overdue" ? "urgent" : "neutral"}>
                            {nextDue(m).offset < 0 ? `${-nextDue(m).offset}d late` : `due ${untilLabel(nextDue(m).offset)}`}
                          </Tag>
                        </li>
                      ))}
                      {tCover.map((c) => (
                        <li key={c.id}>
                          <Link href="/home" className="hover:underline">
                            {c.title}
                          </Link>{" "}
                          <Tag tone="neutral">{c.kind === "insurance" ? "renews" : "ends"} {untilLabel(c.endsOffset)}</Tag>
                        </li>
                      ))}
                    </Group>
                  )}
                  {tAppts.length > 0 && (
                    <Group label="Appointments">
                      {tAppts.map((a) => (
                        <li key={a.id}>
                          <Link href="/appointments" className="hover:underline">
                            {a.title}
                          </Link>{" "}
                          <Tag tone="neutral">{STATUS_LABEL[a.status]}</Tag>
                        </li>
                      ))}
                    </Group>
                  )}
                  {tMail.length > 0 && (
                    <Group label="Email">
                      {tMail.map((m) => (
                        <li key={m.id}>
                          <Link href="/inbox" className="hover:underline">
                            {m.subject}
                          </Link>{" "}
                          <span className="text-muted">· {m.from}</span>
                        </li>
                      ))}
                    </Group>
                  )}
                  {tDates.length > 0 && (
                    <Group label="Dates">
                      {tDates.map((r) => (
                        <li key={r.id}>
                          {r.title} <Tag tone="neutral">{untilLabel(r.dayOffset)}</Tag>
                        </li>
                      ))}
                    </Group>
                  )}
                  {tNotes.length > 0 && (
                    <Group label="Notes">
                      {tNotes.map((n) => (
                        <li key={n.id} className="italic">
                          “{n.text}”
                        </li>
                      ))}
                    </Group>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold tracking-wide text-muted uppercase">{label}</p>
      <ul className="mt-1.5 space-y-1.5 text-[15px]">{children}</ul>
    </div>
  );
}
