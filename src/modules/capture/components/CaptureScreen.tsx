"use client";

import Link from "next/link";
import { useState } from "react";
import { addDays, formatDay, startOfDay, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Button, Card, CheckCircle, EmptyState, PageHeader, Segmented, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { addTask, type TaskCategory } from "@/modules/tasks";
import { addThreadNote, createThread, threadStore, type LifeThread } from "@/modules/threads";
import { parseBrainDump, type Suggestion, type SuggestionKind } from "../data/parse";
import { draftStore } from "../data/store";
import { VoiceSheet } from "./VoiceSheet";

type Editable = Suggestion & {
  include: boolean;
  dueDate?: string; // YYYY-MM-DD
  dueSource?: string;
  thread: string; // thread id, "" for none, "__new" for a new thread
  newThreadName: string;
};

const NEW = "__new";

const THREAD_CATEGORY: Record<string, TaskCategory> = {
  "t-dental": "Health",
  "t-derm": "Health",
  "t-car": "Money",
  "t-house": "Home",
  "t-return": "Errands",
  "t-party": "Social",
  "t-lisbon": "Travel",
};

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CaptureScreen() {
  const now = useNow();
  const draft = useStore(draftStore);
  const threads = useStore(threadStore);
  const [step, setStep] = useState<"compose" | "review" | "done">("compose");
  const [items, setItems] = useState<Editable[]>([]);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [result, setResult] = useState<{ tasks: number; reminders: number; notes: number; threads: number } | null>(null);

  function review() {
    const parsed = parseBrainDump(draft, now, threads);
    setItems(
      parsed.map((s) => ({
        ...s,
        include: true,
        dueDate: s.due ? toISO(addDays(now, s.due.dayOffset)) : undefined,
        dueSource: s.due?.phrase,
        thread: s.threadId ?? "",
        newThreadName: "",
      })),
    );
    setStep("review");
  }

  const update = (id: string, patch: Partial<Editable>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const included = items.filter((i) => i.include);
  const blocked = included.filter(
    (i) => !i.title.trim() || (i.kind === "note" && !i.thread) || (i.thread === NEW && !i.newThreadName.trim()),
  );

  function commit() {
    const created = new Map<string, string>();
    const counts = { tasks: 0, reminders: 0, notes: 0, threads: 0 };
    for (const i of included) {
      let threadId = i.thread || undefined;
      if (i.thread === NEW) {
        const key = i.newThreadName.trim().toLowerCase();
        if (!created.has(key)) {
          created.set(key, createThread(i.newThreadName));
          counts.threads += 1;
        }
        threadId = created.get(key);
      }
      if (i.kind === "note") {
        addThreadNote(threadId!, i.title);
        counts.notes += 1;
      } else {
        addTask({ title: i.title, kind: i.kind, category: (threadId && THREAD_CATEGORY[threadId]) || "Errands", dueDate: i.dueDate, dueSource: i.dueDate ? i.dueSource : undefined, threadId });
        counts[i.kind === "reminder" ? "reminders" : "tasks"] += 1;
      }
    }
    draftStore.set("");
    setResult(counts);
    setStep("done");
  }

  if (step === "done" && result) {
    const parts = [
      result.tasks && `${result.tasks} task${result.tasks > 1 ? "s" : ""}`,
      result.reminders && `${result.reminders} reminder${result.reminders > 1 ? "s" : ""}`,
      result.notes && `${result.notes} thread note${result.notes > 1 ? "s" : ""}`,
      result.threads && `${result.threads} new Life Thread${result.threads > 1 ? "s" : ""}`,
    ].filter(Boolean);
    return (
      <div className="max-w-2xl">
        <PageHeader title="Added" />
        <Card className="mt-6 animate-rise">
          <p className="flex items-center gap-2 font-semibold text-accent">
            <Icon.Check width={20} height={20} /> {parts.length ? parts.join(", ") : "Nothing"} added
          </p>
          <p className="mt-1 text-sm text-muted">Only what you approved was added. Everything else was left out.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/tasks" className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 font-semibold text-accent-ink">
              Open Tasks
            </Link>
            <Link href="/threads" className="inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-line bg-surface px-4 font-semibold">
              Life Threads
            </Link>
            <Button variant="quiet" onClick={() => setStep("compose")}>
              New brain dump
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="max-w-2xl">
        <button type="button" onClick={() => setStep("compose")} className="mb-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent">
          <Icon.Back width={20} height={20} /> Edit brain dump
        </button>
        <PageHeader title="Review suggestions" subtitle="Nothing is added until you say so. Edit, switch off or re-file anything." />

        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No suggestions found">Try writing a few short thoughts, one per line.</EmptyState>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((i) => (
              <li key={i.id} className={cx("rounded-[22px] border border-line/70 p-4 transition-colors", i.include ? "bg-surface shadow-soft" : "bg-surface-2")}>
                <div className="flex items-start gap-3">
                  <CheckCircle checked={i.include} onToggle={() => update(i.id, { include: !i.include })} label={`Include: ${i.title}`} />
                  <div className="min-w-0 flex-1">
                    <label className="sr-only" htmlFor={`title-${i.id}`}>
                      Title
                    </label>
                    <input
                      id={`title-${i.id}`}
                      value={i.title}
                      disabled={!i.include}
                      onChange={(e) => update(i.id, { title: e.target.value })}
                      className="min-h-11 w-full rounded-xl border-[1.5px] border-line bg-bg px-3 font-semibold"
                    />
                    <p className="mt-1.5 text-xs text-muted">From: “{i.source}”</p>
                  </div>
                </div>

                {i.include && (
                  <div className="mt-3 space-y-3 sm:pl-10">
                    <Segmented<SuggestionKind>
                      label={`Type for ${i.title}`}
                      value={i.kind}
                      onChange={(k) => update(i.id, { kind: k })}
                      options={[
                        { value: "task", label: "Task" },
                        { value: "reminder", label: "Reminder" },
                        { value: "note", label: "Thread note" },
                      ]}
                    />

                    <ThreadPicker item={i} threads={threads} onChange={(p) => update(i.id, p)} />

                    {i.kind !== "note" && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {i.dueDate ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 font-semibold text-accent">
                              <Icon.Calendar width={14} height={14} /> Due {formatDay(new Date(i.dueDate + "T00:00:00"))}
                            </span>
                            <span className="text-muted">{i.dueSource ? `from “${i.dueSource}”` : "set by you"}</span>
                            <Button size="sm" variant="quiet" onClick={() => update(i.id, { dueDate: undefined, dueSource: undefined })}>
                              Remove date
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-muted">No date{i.timeHint ? ` (you said “${i.timeHint}”, so no exact date was set)` : ""}</span>
                            <label className="inline-flex items-center gap-2">
                              <span className="sr-only">Set a date for {i.title}</span>
                              <input
                                type="date"
                                min={toISO(startOfDay(now))}
                                onChange={(e) => update(i.id, { dueDate: e.target.value || undefined, dueSource: undefined })}
                                className="min-h-10 rounded-xl border-[1.5px] border-line bg-bg px-2"
                              />
                            </label>
                          </>
                        )}
                      </div>
                    )}
                    {i.kind === "note" && !i.thread && <p className="text-sm font-semibold text-urgent">Pick a Life Thread for this note, or switch it off.</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="sticky bottom-[calc(92px+env(safe-area-inset-bottom,0px))] z-10 mt-5 flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-bg lg:bottom-6">
          <span className="text-sm">{blocked.length ? `${blocked.length} item${blocked.length > 1 ? "s" : ""} need a fix` : `${included.length} selected`}</span>
          <button
            type="button"
            disabled={included.length === 0 || blocked.length > 0}
            onClick={commit}
            className="inline-flex min-h-11 items-center rounded-xl bg-bg px-4 font-semibold text-ink disabled:opacity-50"
          >
            Add {included.length} item{included.length === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Brain dump" subtitle="Type or talk it all out. You'll review every suggestion before anything is added." />
      <label htmlFor="dump" className="sr-only">
        Brain dump
      </label>
      <textarea
        id="dump"
        value={draft}
        onChange={(e) => draftStore.set(e.target.value)}
        placeholder={"Whatever's on your mind…\ne.g. I need to schedule my dentist appointment, order cat food, and check on the insurance renewal."}
        className="mt-5 min-h-56 w-full resize-y rounded-3xl border-[1.5px] border-line bg-surface p-4 text-[17px] leading-relaxed"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={review} disabled={!draft.trim()}>
          <Icon.Sparkle width={18} height={18} /> Sort it out
        </Button>
        <Button variant="ghost" onClick={() => setVoiceOpen(true)}>
          <Icon.Mic width={18} height={18} /> Voice note (simulated)
        </Button>
        {draft && (
          <Button variant="quiet" onClick={() => draftStore.set("")}>
            Clear
          </Button>
        )}
      </div>
      <p className="mt-4 text-sm text-muted">
        Sorting uses simple rules on this device, not AI. Dates are only set when you say one (like “by Friday”); vague timing stays a hint.
      </p>
      <VoiceSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} onUse={(t) => draftStore.set((d) => (d.trim() ? `${d.trim()}\n${t}` : t))} />
    </div>
  );
}

function ThreadPicker({ item, threads, onChange }: { item: Editable; threads: LifeThread[]; onChange: (p: Partial<Editable>) => void }) {
  const suggested = item.threadId && item.thread === item.threadId;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label htmlFor={`thread-${item.id}`} className="flex items-center gap-1.5 font-semibold">
        <Icon.Thread width={16} height={16} /> Life Thread
      </label>
      <select
        id={`thread-${item.id}`}
        value={item.thread}
        onChange={(e) => onChange({ thread: e.target.value })}
        className="min-h-10 max-w-full rounded-xl border-[1.5px] border-line bg-bg px-2"
      >
        <option value="">None</option>
        {threads.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
        <option value={NEW}>+ New Life Thread…</option>
      </select>
      {suggested && <span className="text-xs text-muted">Suggested from your words</span>}
      {item.thread === NEW && (
        <input
          aria-label="New Life Thread name"
          placeholder="Thread name"
          value={item.newThreadName}
          onChange={(e) => onChange({ newThreadName: e.target.value })}
          className="min-h-10 min-w-0 flex-1 rounded-xl border-[1.5px] border-line bg-bg px-3"
        />
      )}
    </div>
  );
}
