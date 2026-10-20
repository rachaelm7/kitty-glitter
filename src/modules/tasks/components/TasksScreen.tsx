"use client";

import { useState } from "react";
import { useNow, relativeDay } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Button, CheckCircle, EmptyState, PageHeader, Segmented, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { addTask, removeTask, sortTasks, taskStore, toggleTask } from "../data/store";

type Filter = "open" | "email" | "all";

export function TasksScreen() {
  const tasks = useStore(taskStore);
  const now = useNow();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("open");

  const shown = sortTasks(tasks).filter((t) => (filter === "open" ? !t.done : filter === "email" ? !!t.fromEmail : true));
  const openCount = tasks.filter((t) => !t.done).length;

  function submit() {
    addTask({ title });
    setTitle("");
  }

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${openCount} open · some were pulled from your email`} />

      <form
        className="mt-5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="new-task" className="sr-only">
          New task
        </label>
        <input
          id="new-task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          autoComplete="off"
          className="min-h-12 min-w-0 flex-1 rounded-2xl border-[1.5px] border-line bg-surface px-4"
        />
        <Button type="submit" disabled={!title.trim()} className="min-h-12">
          <Icon.Plus width={18} height={18} /> Add
        </Button>
      </form>

      <div className="mt-4">
        <Segmented
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "open", label: "Open" },
            { value: "email", label: "From email" },
            { value: "all", label: "All" },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={filter === "open" ? "Everything's done" : "Nothing here yet"} icon={<Icon.Tasks />}>
            {filter === "open" ? "Enjoy the quiet, or add something above." : "Tasks you add or pull from email will show up here."}
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface px-4">
          {shown.map((t) => (
            <li key={t.id} className={cx("group flex items-center gap-3 py-3", t.done && "opacity-60")}>
              <CheckCircle checked={t.done} onToggle={() => toggleTask(t.id)} label={`${t.done ? "Mark not done" : "Mark done"}: ${t.title}`} />
              <div className="min-w-0 flex-1">
                <p className={cx("break-words", t.done && "line-through")}>{t.title}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {t.fromEmail && <Tag>From email · {t.fromEmail.sender}</Tag>}
                  {t.dueDayOffset !== undefined && <Tag tone="neutral">Due {relativeDay(t.dueDayOffset, now)}</Tag>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTask(t.id)}
                aria-label={`Delete task: ${t.title}`}
                className="grid size-10 flex-none place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
              >
                <Icon.Close width={18} height={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
