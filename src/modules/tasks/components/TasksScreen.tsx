"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { relativeDay, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { clearIntent, intentStore, requestOpen } from "@/core/store/intent";
import { Button, CheckCircle, Chip, EmptyState, PageHeader, Segmented, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { ThreadTag } from "@/modules/threads";
import { dueOffset, viewCounts, viewTasks, type TaskView } from "../data/logic";
import { repeatLabel } from "../data/recur";
import { addTask, taskStore, toggleTask } from "../data/store";
import { CATEGORIES, type Task, type TaskCategory } from "../data/types";
import { TaskSheet } from "./TaskSheet";

const EMPTY: Record<TaskView, { title: string; body: string }> = {
  today: { title: "Nothing due today", body: "Enjoy the breathing room, or pull something forward from Upcoming." },
  upcoming: { title: "Nothing upcoming", body: "Tasks with later dates, or no date, show up here." },
  waiting: { title: "Not waiting on anyone", body: "Mark a task “Waiting on” when the next step is someone else's." },
  done: { title: "Nothing completed yet", body: "Checked-off tasks collect here." },
};

export function TasksScreen() {
  const tasks = useStore(taskStore);
  const intent = useStore(intentStore);
  const now = useNow();
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [view, setView] = useState<TaskView>("today");
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [sheet, setSheet] = useState<{ kind: "new" } | { kind: "edit"; id: string } | null>(null);

  const counts = viewCounts(tasks, now);
  const shown = viewTasks(tasks, view, now).filter((t) => category === "all" || t.category === category);
  const usedCategories = CATEGORIES.filter((c) => tasks.some((t) => t.category === c));
  const editId = sheet?.kind === "edit" ? sheet.id : intent.task;
  const editing = tasks.find((t) => t.id === editId);

  function quickAdd() {
    if (!title.trim()) return;
    addTask({ title, ...(view === "today" ? { dueDayOffset: 0 } : {}) });
    toast(view === "today" ? "Added to Today" : "Added to Upcoming");
    setTitle("");
    if (view === "waiting" || view === "done") setView("upcoming");
  }

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${counts.today} for today · ${counts.upcoming} upcoming · ${counts.waiting} waiting on others`} />

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          quickAdd();
        }}
      >
        <label htmlFor="new-task" className="sr-only">
          New task
        </label>
        <input
          id="new-task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={view === "today" ? "Add a task for today" : "Add a task"}
          autoComplete="off"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-[1.5px] border-line bg-surface px-4 shadow-soft"
        />
        <Button type="submit" disabled={!title.trim()} className="min-h-12">
          <Icon.Plus width={18} height={18} /> Add
        </Button>
      </form>
      <Button size="sm" variant="quiet" className="mt-1 -ml-3" onClick={() => setSheet({ kind: "new" })}>
        <Icon.Pencil width={16} height={16} /> Add with details
      </Button>

      <div className="mt-3">
        <Segmented<TaskView>
          label="Show"
          value={view}
          onChange={setView}
          options={[
            { value: "today", label: "Today", count: counts.today },
            { value: "upcoming", label: "Upcoming", count: counts.upcoming },
            { value: "waiting", label: "Waiting", count: counts.waiting },
            { value: "done", label: "Done", count: counts.done },
          ]}
        />
      </div>

      <div role="group" aria-label="Filter by category" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip pressed={category === "all"} onClick={() => setCategory("all")}>
          All categories
        </Chip>
        {usedCategories.map((c) => (
          <Chip key={c} pressed={category === c} onClick={() => setCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={EMPTY[view].title} icon={<Icon.Tasks />}>
            {EMPTY[view].body}
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-3 overflow-hidden rounded-[22px] border border-line/70 bg-surface shadow-soft">
          {shown.map((t) => (
            <TaskRow
              key={t.id}
              t={t}
              now={now}
              onToggle={() => {
                const wasDone = t.status === "done";
                toggleTask(t.id);
                toast(wasDone ? "Moved back to your list" : t.repeatEveryDays ? `Done. Next one is due in ${t.repeatEveryDays} days` : "Nice. Marked done", { label: "Undo", onClick: () => toggleTask(t.id) });
              }}
              onOpen={() => setSheet({ kind: "edit", id: t.id })}
              onOpenEmail={() => {
                requestOpen({ email: t.emailId });
                router.push("/inbox");
              }}
            />
          ))}
        </ul>
      )}

      <TaskSheet
        mode={sheet?.kind === "new" ? { kind: "new" } : editing ? { kind: "edit", task: editing } : null}
        onClose={() => {
          setSheet(null);
          clearIntent("task");
        }}
      />
    </div>
  );
}

function TaskRow({ t, now, onToggle, onOpen, onOpenEmail }: { t: Task; now: Date; onToggle: () => void; onOpen: () => void; onOpenEmail: () => void }) {
  const off = dueOffset(t, now);
  const done = t.status === "done";
  return (
    <li className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0">
      <span className="pt-0.5">
        <CheckCircle checked={done} onToggle={onToggle} label={`${done ? "Mark not done" : "Mark done"}: ${t.title}`} />
      </span>
      <div className="min-w-0 flex-1">
        <button type="button" onClick={onOpen} className="block w-full text-left">
          <span className={cx("block font-medium break-words", done && "text-muted line-through")}>{t.title}</span>
          {t.status === "waiting" && <span className="mt-0.5 block text-sm text-lavender">Waiting on {t.waitingOn}</span>}
          {t.notes && <span className="mt-0.5 block truncate text-sm text-muted">{t.notes}</span>}
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Tag tone="lavender">{t.category}</Tag>
          {t.kind === "reminder" && <Tag tone="neutral">Reminder</Tag>}
          {t.repeatEveryDays && (
            <Tag tone="neutral">
              <Icon.Undo width={12} height={12} /> {repeatLabel(t.repeatEveryDays)}
            </Tag>
          )}
          {t.linkedTo && (
            <Link href="/home" className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold hover:bg-surface-2">
              <Icon.House width={13} height={13} /> Home upkeep
            </Link>
          )}
          {off !== undefined && !done && <Tag tone={off < 0 ? "urgent" : off === 0 ? "accent" : "champagne"}>{off < 0 ? `Overdue · ${relativeDay(off, now)}` : `Due ${relativeDay(off, now)}`}</Tag>}
          {t.emailId && (
            <button type="button" onClick={onOpenEmail} className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold hover:bg-surface-2">
              <Icon.Mail width={13} height={13} /> {t.emailFrom}
            </button>
          )}
          {t.threadId && <ThreadTag id={t.threadId} />}
        </div>
      </div>
      <button type="button" onClick={onOpen} aria-label={`Edit task: ${t.title}`} className="grid size-10 flex-none place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">
        <Icon.Pencil width={18} height={18} />
      </button>
    </li>
  );
}
