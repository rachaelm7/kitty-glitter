"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addDays, formatDay, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { requestOpen } from "@/core/store/intent";
import { Sheet } from "@/core/ui/Sheet";
import { Button, Segmented } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { threadStore } from "@/modules/threads";
import { dueOffset, toISODate } from "../data/logic";
import { REPEAT_OPTIONS } from "../data/recur";
import { addTask, removeTask, updateTask } from "../data/store";
import { CATEGORIES, type Task, type TaskCategory, type TaskStatus } from "../data/types";

type Mode = { kind: "new" } | { kind: "edit"; task: Task };

export function TaskSheet({ mode, onClose }: { mode: Mode | null; onClose: () => void }) {
  return (
    <Sheet open={!!mode} onClose={onClose} title={mode?.kind === "edit" ? "Task details" : "New task"}>
      {mode && <TaskForm key={mode.kind === "edit" ? mode.task.id : "new"} mode={mode} onDone={onClose} />}
    </Sheet>
  );
}

function TaskForm({ mode, onDone }: { mode: Mode; onDone: () => void }) {
  const now = useNow();
  const router = useRouter();
  const toast = useToast();
  const threads = useStore(threadStore);
  const t = mode.kind === "edit" ? mode.task : undefined;
  const initialDue = t ? dueOffset(t, now) : undefined;

  const [title, setTitle] = useState(t?.title ?? "");
  const [notes, setNotes] = useState(t?.notes ?? "");
  const [category, setCategory] = useState<TaskCategory>(t?.category ?? "Errands");
  const [status, setStatus] = useState<TaskStatus>(t?.status ?? "open");
  const [waitingOn, setWaitingOn] = useState(t?.waitingOn ?? "");
  const [due, setDue] = useState(initialDue !== undefined ? toISODate(addDays(now, initialDue)) : "");
  const [threadId, setThreadId] = useState(t?.threadId ?? "");
  const [repeat, setRepeat] = useState(t?.repeatEveryDays ? String(t.repeatEveryDays) : "");
  const [touched, setTouched] = useState(false);
  const titleError = touched && !title.trim();

  function save() {
    setTouched(true);
    if (!title.trim()) return;
    const dueChanged = due !== (initialDue !== undefined ? toISODate(addDays(now, initialDue)) : "");
    const patch: Partial<Task> = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      status,
      waitingOn: status === "waiting" ? waitingOn.trim() || "Someone else" : undefined,
      threadId: threadId || undefined,
      repeatEveryDays: repeat ? Number(repeat) : undefined,
      ...(dueChanged ? { dueDate: due || undefined, dueDayOffset: undefined, dueSource: undefined } : {}),
    };
    if (t) {
      updateTask(t.id, patch);
      toast("Task updated");
    } else {
      addTask({ ...patch, title: patch.title! });
      toast("Task added");
    }
    onDone();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      noValidate
    >
      <h3 className="pr-12 text-xl">{t ? "Task details" : "New task"}</h3>

      <label htmlFor="task-title" className="mt-4 block text-sm font-semibold">
        Title
      </label>
      <input
        id="task-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-invalid={titleError}
        aria-describedby={titleError ? "task-title-error" : undefined}
        className="mt-1 min-h-12 w-full rounded-2xl border-[1.5px] border-line bg-bg px-3.5 aria-invalid:border-urgent"
      />
      {titleError && (
        <p id="task-title-error" className="mt-1 text-sm font-semibold text-urgent">
          Give the task a short title.
        </p>
      )}

      <p className="mt-4 mb-1 text-sm font-semibold">Status</p>
      <Segmented<TaskStatus>
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          { value: "open", label: "To do" },
          { value: "waiting", label: "Waiting on" },
          { value: "done", label: "Done" },
        ]}
      />
      {status === "waiting" && (
        <>
          <label htmlFor="task-waiting" className="mt-3 block text-sm font-semibold">
            Waiting on
          </label>
          <input
            id="task-waiting"
            value={waitingOn}
            onChange={(e) => setWaitingOn(e.target.value)}
            placeholder="e.g. the office to call back"
            className="mt-1 min-h-11 w-full rounded-2xl border-[1.5px] border-line bg-bg px-3.5"
          />
        </>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="task-category" className="block text-sm font-semibold">
            Category
          </label>
          <select
            id="task-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="mt-1 min-h-11 w-full rounded-2xl border-[1.5px] border-line bg-bg px-3"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-due" className="block text-sm font-semibold">
            Due date <span className="font-normal text-muted">(optional)</span>
          </label>
          <div className="mt-1 flex gap-2">
            <input id="task-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className="min-h-11 min-w-0 flex-1 rounded-2xl border-[1.5px] border-line bg-bg px-3" />
            {due && (
              <Button size="sm" variant="quiet" onClick={() => setDue("")} aria-label="Clear due date">
                Clear
              </Button>
            )}
          </div>
          {t?.dueSource && !due && <p className="mt-1 text-xs text-muted">Was set from “{t.dueSource}”.</p>}
        </div>
      </div>

      <label htmlFor="task-repeat" className="mt-4 block text-sm font-semibold">
        Repeats
      </label>
      <select id="task-repeat" value={repeat} onChange={(e) => setRepeat(e.target.value)} className="mt-1 min-h-11 w-full rounded-2xl border-[1.5px] border-line bg-bg px-3">
        <option value="">Never</option>
        {t?.repeatEveryDays && !REPEAT_OPTIONS.some((o) => o.days === t.repeatEveryDays) && <option value={t.repeatEveryDays}>Every {t.repeatEveryDays} days</option>}
        {REPEAT_OPTIONS.map((o) => (
          <option key={o.days} value={o.days}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-muted">
        {repeat ? "When you finish it, the next one is added, due that many days later." : "Pick a repeat and the next one appears when you finish this."}
      </p>

      <label htmlFor="task-thread" className="mt-4 block text-sm font-semibold">
        Life Thread
      </label>
      <select id="task-thread" value={threadId} onChange={(e) => setThreadId(e.target.value)} className="mt-1 min-h-11 w-full rounded-2xl border-[1.5px] border-line bg-bg px-3">
        <option value="">None</option>
        {threads.map((th) => (
          <option key={th.id} value={th.id}>
            {th.name}
          </option>
        ))}
      </select>

      <label htmlFor="task-notes" className="mt-4 block text-sm font-semibold">
        Notes
      </label>
      <textarea id="task-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 min-h-20 w-full resize-y rounded-2xl border-[1.5px] border-line bg-bg p-3" />

      {t?.emailId && (
        <button
          type="button"
          onClick={() => {
            requestOpen({ email: t.emailId });
            router.push("/inbox");
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-accent-soft p-3.5 text-left"
        >
          <Icon.Mail className="flex-none text-accent" />
          <span className="min-w-0 flex-1">
            <b className="block font-semibold">From an email</b>
            <span className="block truncate text-sm text-muted">{t.emailFrom}: open it in Inbox</span>
          </span>
          <Icon.Chevron width={18} height={18} className="text-muted" />
        </button>
      )}
      {initialDue !== undefined && t && <p className="mt-3 text-xs text-muted">Currently due {formatDay(addDays(now, initialDue))}.</p>}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="submit">{t ? "Save changes" : "Add task"}</Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        {t && (
          <Button
            variant="quiet"
            className="ml-auto text-urgent hover:bg-urgent-soft"
            onClick={() => {
              const snapshot = t;
              removeTask(t.id);
              onDone();
              toast("Task deleted", { label: "Undo", onClick: () => addTask({ ...snapshot }) });
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
