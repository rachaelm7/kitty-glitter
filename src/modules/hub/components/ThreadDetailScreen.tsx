"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addDays, formatDay, relativeDay } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { requestOpen } from "@/core/store/intent";
import { Button, Card, CheckCircle, EmptyState, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { STATUS_LABEL } from "@/modules/appointments";
import { markRead } from "@/modules/email";
import { toggleTask } from "@/modules/tasks";
import { addThreadNote, removeThreadNote, threadStore, updateThread } from "@/modules/threads";
import { buildThreadView, type TimelineItem } from "../data/threadView";
import { StagePill } from "./StagePill";
import { useThreadSources } from "./useThreadSources";

const KIND_ICON: Record<TimelineItem["kind"], keyof typeof Icon> = {
  email: "Mail",
  task: "Tasks",
  appointment: "Calendar",
  note: "Pencil",
  update: "Sparkle",
  booking: "Star",
};

export function ThreadDetailScreen({ id }: { id: string }) {
  const thread = useStore(threadStore).find((t) => t.id === id);
  const src = useThreadSources();
  const router = useRouter();
  const toast = useToast();
  const [note, setNote] = useState("");

  if (!thread) {
    return (
      <div className="max-w-xl">
        <BackLink />
        <EmptyState title="This thread isn't here" icon={<Icon.Thread />}>
          It may have been created on another device, or the demo data was reset.
        </EmptyState>
      </div>
    );
  }

  const v = buildThreadView(thread, src);
  const I = Icon[thread.icon];
  const done = thread.stage === "done";

  function openEmail(emailId: string) {
    markRead(emailId);
    requestOpen({ email: emailId });
    router.push("/inbox");
  }
  function openTask(taskId: string) {
    requestOpen({ task: taskId });
    router.push("/tasks");
  }

  return (
    <div className="max-w-3xl">
      <BackLink />
      <header className="flex items-start gap-3.5 animate-rise">
        <span className="grid size-14 flex-none place-items-center rounded-3xl" style={{ background: `${thread.color}1f`, color: thread.color }}>
          <I width={28} height={28} />
        </span>
        <div className="min-w-0">
          <h1 className="text-[30px] leading-tight lg:text-[36px]">{thread.name}</h1>
          <p className="mt-1 text-muted">{thread.blurb}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StagePill stage={thread.stage} />
            <span className="text-sm font-semibold">{done ? "Wrapped up" : thread.status}</span>
          </div>
        </div>
      </header>

      {!done && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {thread.next && (
            <div className="rounded-[22px] bg-accent p-4 text-accent-ink shadow-soft">
              <p className="text-xs font-bold tracking-wide uppercase opacity-90">Next step</p>
              <p className="mt-1 text-lg font-semibold">{thread.next.label}</p>
              {(thread.next.emailId || thread.next.taskId) && (
                <button
                  type="button"
                  onClick={() => (thread.next!.emailId ? openEmail(thread.next!.emailId) : openTask(thread.next!.taskId!))}
                  className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-ink/20 px-3 text-sm font-semibold"
                >
                  {thread.next.emailId ? "Open the email" : "Open the task"} <Icon.Chevron width={16} height={16} />
                </button>
              )}
            </div>
          )}
          <div className="rounded-[22px] bg-lavender-soft p-4">
            <p className="text-xs font-bold tracking-wide text-lavender uppercase">Waiting on</p>
            <p className="mt-1 font-semibold">{thread.waitingOn ?? "Nobody. The next move is yours."}</p>
          </div>
        </div>
      )}

      <section className="mt-8" aria-labelledby="tl">
        <h2 id="tl" className="mb-3 text-[21px]">
          Timeline
        </h2>
        <Card>
          {v.past.length + v.upcoming.length === 0 ? (
            <p className="text-sm text-muted">Nothing recorded yet. Add a note below.</p>
          ) : (
            <>
              <Timeline items={v.past} now={src.now} onEmail={openEmail} />
              {v.upcoming.length > 0 && (
                <>
                  <p className="mt-4 mb-2 text-xs font-bold tracking-wide text-muted uppercase">Coming up</p>
                  <Timeline items={v.upcoming} now={src.now} onEmail={openEmail} future />
                </>
              )}
            </>
          )}
        </Card>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="t-tasks">
          <h2 id="t-tasks" className="mb-3 text-[21px]">
            Tasks
          </h2>
          {v.tasks.length === 0 ? (
            <p className="text-sm text-muted">No tasks in this thread.</p>
          ) : (
            <Card className="py-1">
              <ul>
                {v.tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                    <CheckCircle checked={t.status === "done"} onToggle={() => toggleTask(t.id)} label={`Done: ${t.title}`} />
                    <button type="button" onClick={() => openTask(t.id)} className={cx("min-w-0 flex-1 text-left", t.status === "done" && "text-muted line-through")}>
                      {t.title}
                      {t.status === "waiting" && <span className="block text-sm text-lavender">Waiting on {t.waitingOn}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section aria-labelledby="t-mail">
          <h2 id="t-mail" className="mb-3 text-[21px]">
            Emails
          </h2>
          {v.emails.length === 0 ? (
            <p className="text-sm text-muted">No emails in this thread.</p>
          ) : (
            <Card className="py-1">
              <ul>
                {v.emails.map((m) => (
                  <li key={m.id} className="border-b border-line last:border-b-0">
                    <button type="button" onClick={() => openEmail(m.id)} className="block w-full py-2.5 text-left">
                      <span className="block text-sm text-muted">{m.from}</span>
                      <span className="block font-semibold">{m.subject}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        {v.appointments.length > 0 && (
          <section aria-labelledby="t-appt">
            <h2 id="t-appt" className="mb-3 text-[21px]">
              Appointments
            </h2>
            <Card className="py-1">
              <ul>
                {v.appointments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
                    <Link href="/appointments" className="min-w-0 hover:underline">
                      <b className="block font-semibold">{a.title}</b>
                      <span className="text-sm text-muted">
                        {a.provider}
                        {a.when && ` · ${formatDay(addDays(src.now, a.when.dayOffset))}, ${a.when.time}`}
                      </span>
                    </Link>
                    <Tag tone="lavender">{STATUS_LABEL[a.status]}</Tag>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line py-2 text-xs text-muted">Fictional demo. Not medical advice.</p>
            </Card>
          </section>
        )}

        {v.trips.length > 0 && (
          <section aria-labelledby="t-trip">
            <h2 id="t-trip" className="mb-3 text-[21px]">
              Trip
            </h2>
            <Card>
              {v.trips.map((t) => (
                <Link key={t.id} href="/travel" className="block hover:underline">
                  <b className="font-semibold">{t.name}</b>
                  <span className="block text-sm text-muted">
                    {formatDay(addDays(src.now, t.startOffset))} · {t.nights} nights · {t.reservations.length} bookings
                  </span>
                </Link>
              ))}
            </Card>
          </section>
        )}
      </div>

      <section className="mt-8" aria-labelledby="t-notes">
        <h2 id="t-notes" className="mb-3 text-[21px]">
          Notes
        </h2>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            addThreadNote(thread.id, note);
            setNote("");
            toast("Note added to the timeline");
          }}
        >
          <label htmlFor="thread-note" className="sr-only">
            Add a note
          </label>
          <input
            id="thread-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's still pending?"
            className="min-h-12 min-w-0 flex-1 rounded-2xl border-[1.5px] border-line bg-surface px-4 shadow-soft"
          />
          <Button type="submit" disabled={!note.trim()} className="min-h-12">
            Add note
          </Button>
        </form>
        {v.notes.length > 0 && (
          <ul className="mt-3 space-y-2">
            {v.notes.map((n) => (
              <li key={n.id} className="flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-sm">
                <span className="flex-1">{n.text}</span>
                <button type="button" aria-label={`Delete note: ${n.text}`} onClick={() => removeThreadNote(n.id)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink">
                  <Icon.Close width={14} height={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-5">
        <Button
          variant="ghost"
          onClick={() => {
            const prev = thread.stage;
            updateThread(thread.id, { stage: done ? "action" : "done" });
            toast(done ? "Thread reopened" : "Thread wrapped up", { label: "Undo", onClick: () => updateThread(thread.id, { stage: prev }) });
          }}
        >
          {done ? "Reopen thread" : <><Icon.Check width={16} height={16} /> Mark thread done</>}
        </Button>
      </div>
    </div>
  );
}

function Timeline({ items, now, onEmail, future }: { items: TimelineItem[]; now: Date; onEmail: (id: string) => void; future?: boolean }) {
  return (
    <ol className="relative ml-2 border-l-2 border-line pl-5">
      {items.map((i) => {
        const I = Icon[KIND_ICON[i.kind]];
        return (
          <li key={i.id} className="relative pb-3.5 last:pb-0">
            <span className={cx("absolute top-0.5 -left-[31px] grid size-6 place-items-center rounded-full border-2 border-surface", future ? "bg-champagne-soft text-champagne" : "bg-accent-soft text-accent")}>
              <I width={12} height={12} />
            </span>
            <p className="text-xs font-semibold text-muted">{i.dayOffset === 0 ? "Today" : relativeDay(i.dayOffset, now).replace(/^./, (c) => c.toUpperCase())}</p>
            {i.emailId ? (
              <button type="button" onClick={() => onEmail(i.emailId!)} className="text-left text-[15px] hover:underline">
                {i.label}
              </button>
            ) : (
              <p className="text-[15px]">{i.label}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function BackLink() {
  return (
    <Link href="/threads" className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent">
      <Icon.Back width={20} height={20} /> Life Threads
    </Link>
  );
}
