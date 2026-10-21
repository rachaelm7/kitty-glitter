import { dueOffset, type Task } from "@/modules/tasks";
import type { LifeThread } from "@/modules/threads";

export type NextStep = { label: string; emailId?: string; taskId?: string; waiting?: boolean };
export type ThreadState = {
  next: NextStep | null;
  waitingOn?: string;
  status: string;
  /** Every task in the thread is finished: time to wrap it up. */
  allDone: boolean;
  /** The next step moved on from the one written in the thread. */
  advanced: boolean;
};

/**
 * A thread's "next step" and "waiting on" follow its tasks, so finishing a
 * task moves the thread forward on its own. Nothing is invented: it only
 * ever points at an existing task or email.
 */
export function deriveThreadState(thread: LifeThread, tasks: Task[], now: Date): ThreadState {
  const own = tasks.filter((t) => t.threadId === thread.id);
  const cfg = thread.next;

  let cfgDone = false;
  if (cfg?.taskId) {
    const t = own.find((x) => x.id === cfg.taskId);
    cfgDone = !t || t.status === "done";
  } else if (cfg?.emailId) {
    const forEmail = own.filter((x) => x.emailId === cfg.emailId);
    cfgDone = forEmail.length > 0 && forEmail.every((x) => x.status === "done");
  }

  const waiting = own.filter((t) => t.status === "waiting");
  const waitingOn = waiting.length ? waiting.map((t) => t.waitingOn ?? "someone else").join(" · ") : thread.waitingOn;

  let next: NextStep | null = cfg && !cfgDone ? cfg : null;
  if (!next) {
    const open = own
      .filter((t) => t.status === "open")
      .sort((a, b) => (dueOffset(a, now) ?? Infinity) - (dueOffset(b, now) ?? Infinity) || b.createdAt - a.createdAt)[0];
    if (open) next = { label: open.title, taskId: open.id, emailId: open.emailId };
    else if (waiting[0]) next = { label: `Check back: ${waiting[0].title}`, taskId: waiting[0].id, waiting: true };
  }

  const allDone = own.length > 0 && next === null;
  return {
    next,
    waitingOn,
    status: allDone ? "Everything's done" : thread.status,
    allDone,
    advanced: !!cfg && next !== cfg,
  };
}
