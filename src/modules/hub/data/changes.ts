import type { Appointment } from "@/modules/appointments";
import type { Message } from "@/modules/email";
import { isUnread } from "@/modules/email";
import type { Task } from "@/modules/tasks";
import type { LifeThread } from "@/modules/threads";

export type Change = {
  id: string;
  kind: "email" | "update" | "finished" | "waiting";
  text: string;
  detail?: string;
  dayOffset: number; // 0 today, -1 yesterday
  urgent?: boolean;
  emailId?: string;
  threadId?: string;
};

export type ChangeSources = {
  messages: Message[];
  inbox: { read: Record<string, boolean>; archived: Record<string, boolean> };
  tasks: Task[];
  appointments: Appointment[];
  threads: LifeThread[];
  now: Date;
};

const DAY = 86_400_000;
const REAL_TIME = 1e12;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const RANK: Record<Change["kind"], number> = { email: 0, update: 1, finished: 2, waiting: 3 };

/**
 * What moved since yesterday, drawn only from data that exists: new mail that
 * needs you, updates on threads and appointments, tasks you finished, and what
 * you're still waiting on.
 */
export function buildChanges(src: ChangeSources): Change[] {
  const today = startOfDay(src.now);
  const out: Change[] = [];

  for (const m of src.messages) {
    if (m.receivedDayOffset < -1 || !m.needsAction || src.inbox.archived[m.id] || !isUnread(m, src.inbox)) continue;
    out.push({ id: `em-${m.id}`, kind: "email", text: `New from ${m.from}`, detail: m.subject, dayOffset: m.receivedDayOffset, urgent: m.urgent, emailId: m.id, threadId: m.threadId });
  }

  const emailKeys = new Set(out.filter((c) => c.threadId).map((c) => `${c.threadId}|${c.dayOffset}`));
  const dup = (threadId: string | undefined, dayOffset: number) => !!threadId && emailKeys.has(`${threadId}|${dayOffset}`);

  for (const t of src.threads) {
    for (const e of t.events) {
      if (e.dayOffset < -1 || e.dayOffset > 0 || dup(t.id, e.dayOffset)) continue;
      out.push({ id: `th-${t.id}-${e.id}`, kind: "update", text: e.label, detail: t.name, dayOffset: e.dayOffset, threadId: t.id });
    }
  }
  for (const a of src.appointments) {
    for (const e of a.events) {
      if (e.dayOffset < -1 || e.dayOffset > 0 || dup(a.threadId, e.dayOffset)) continue;
      out.push({ id: `ap-${a.id}-${e.id}`, kind: "update", text: `${a.title}: ${e.label}`, detail: a.provider, dayOffset: e.dayOffset, threadId: a.threadId });
    }
  }

  for (const t of src.tasks) {
    if (t.status !== "done" || !t.completedAt || t.completedAt < REAL_TIME) continue;
    const offset = Math.round((startOfDay(new Date(t.completedAt)) - today) / DAY);
    if (offset < -1 || offset > 0) continue;
    out.push({ id: `tk-${t.id}`, kind: "finished", text: `You finished: ${t.title}`, dayOffset: offset, threadId: t.threadId });
  }

  const waiting = src.tasks.filter((t) => t.status === "waiting");
  if (waiting.length) {
    const names = waiting.slice(0, 2).map((t) => t.waitingOn ?? t.title).join(" · ");
    out.push({ id: "waiting", kind: "waiting", text: `Still waiting on ${waiting.length} ${waiting.length === 1 ? "thing" : "things"}`, detail: names + (waiting.length > 2 ? " · …" : ""), dayOffset: 0 });
  }

  return out.sort((a, b) => b.dayOffset - a.dayOffset || Number(!!b.urgent) - Number(!!a.urgent) || RANK[a.kind] - RANK[b.kind]);
}

/** One calm sentence for the brief. */
export function summarizeChanges(changes: Change[]): string {
  const n = (kind: Change["kind"]) => changes.filter((c) => c.kind === kind).length;
  const emails = n("email");
  const updates = n("update");
  const finished = n("finished");
  const waiting = changes.find((c) => c.kind === "waiting");
  const parts = [
    emails && `${emails} new ${emails === 1 ? "email needs" : "emails need"} you`,
    updates && `${updates} ${updates === 1 ? "update" : "updates"} on your threads`,
    finished && `${finished} ${finished === 1 ? "task" : "tasks"} finished`,
    waiting && waiting.text.replace("Still waiting on", "waiting on"),
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Nothing new since yesterday.";
}
