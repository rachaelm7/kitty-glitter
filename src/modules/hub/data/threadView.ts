import type { Appointment } from "@/modules/appointments";
import type { Renewal } from "@/modules/bills";
import type { Message } from "@/modules/email";
import type { Task } from "@/modules/tasks";
import type { LifeThread, ThreadNote } from "@/modules/threads";
import type { Trip } from "@/modules/travel";

export type TimelineItem = {
  id: string;
  dayOffset: number;
  label: string;
  kind: "email" | "task" | "appointment" | "note" | "update" | "booking";
  emailId?: string;
};

export type ThreadSources = {
  messages: Message[];
  tasks: Task[];
  appointments: Appointment[];
  trips: Trip[];
  renewals: Renewal[];
  notes: ThreadNote[];
  now: Date;
};

const DAY = 86_400_000;
const isRealTimestamp = (n?: number) => !!n && n > 1e12;
function offsetFrom(ts: number, now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return Math.floor((ts - start.getTime()) / DAY);
}

/** Everything related to one thread, plus a merged, dated timeline. */
export function buildThreadView(thread: LifeThread, src: ThreadSources) {
  const emails = src.messages.filter((m) => m.threadId === thread.id);
  const tasks = src.tasks.filter((t) => t.threadId === thread.id);
  const appointments = src.appointments.filter((a) => a.threadId === thread.id);
  const trips = src.trips.filter((t) => t.threadId === thread.id);
  const dates = src.renewals.filter((r) => r.threadId === thread.id);
  const notes = src.notes.filter((n) => n.threadId === thread.id);

  const timeline: TimelineItem[] = [
    ...thread.events.map((e) => ({ ...e, id: `ev-${e.id}` })),
    ...emails.map((m) => ({ id: `em-${m.id}`, dayOffset: m.receivedDayOffset, label: `Email from ${m.from}: “${m.subject}”`, kind: "email" as const, emailId: m.id })),
    ...appointments.flatMap((a) => [
      ...a.events.map((e) => ({ id: `ap-${a.id}-${e.id}`, dayOffset: e.dayOffset, label: `${a.title}: ${e.label}`, kind: "appointment" as const })),
      ...(a.when ? [{ id: `ap-${a.id}-when`, dayOffset: a.when.dayOffset, label: a.when.time ? `${a.title} at ${a.when.time}` : a.title, kind: "appointment" as const }] : []),
    ]),
    ...trips.flatMap((t) => t.reservations.map((r) => ({ id: `tr-${t.id}-${r.id}`, dayOffset: t.startOffset + r.dayIndex, label: r.title, kind: "booking" as const }))),
    ...dates.map((r) => ({ id: `rn-${r.id}`, dayOffset: r.dayOffset, label: r.title, kind: "update" as const })),
    ...tasks
      .filter((t) => t.status === "done" && isRealTimestamp(t.completedAt))
      .map((t) => ({ id: `tk-${t.id}`, dayOffset: offsetFrom(t.completedAt!, src.now), label: `Done: ${t.title}`, kind: "task" as const })),
    ...notes.map((n) => ({ id: `nt-${n.id}`, dayOffset: offsetFrom(n.createdAt, src.now), label: `Note: ${n.text}`, kind: "note" as const })),
  ];
  // Deduplicate identical labels on the same day (e.g. an appointment booked by email).
  const seen = new Set<string>();
  const unique = timeline.filter((i) => (seen.has(`${i.dayOffset}|${i.label}`) ? false : (seen.add(`${i.dayOffset}|${i.label}`), true)));
  const sorted = unique.sort((a, b) => a.dayOffset - b.dayOffset);

  return {
    emails,
    tasks,
    appointments,
    trips,
    dates,
    notes,
    past: sorted.filter((i) => i.dayOffset <= 0),
    upcoming: sorted.filter((i) => i.dayOffset > 0),
    openTasks: tasks.filter((t) => t.status !== "done").length,
  };
}
