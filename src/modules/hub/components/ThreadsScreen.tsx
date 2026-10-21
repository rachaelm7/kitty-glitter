"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/core/store/createStore";
import { Chip, EmptyState, PageHeader } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { threadStore, type ThreadStage } from "@/modules/threads";
import { buildThreadView } from "../data/threadView";
import { deriveThreadState } from "../data/threadState";
import { StagePill, STAGE_LABEL } from "./StagePill";
import { useThreadSources } from "./useThreadSources";

const ORDER: ThreadStage[] = ["action", "waiting", "scheduled", "done"];

/** Life Threads: every unfinished situation, with what's next and who you're waiting on. */
export function ThreadsScreen() {
  const threads = useStore(threadStore);
  const src = useThreadSources();
  const [stage, setStage] = useState<ThreadStage | "all">("all");
  const shown = threads.filter((t) => stage === "all" || t.stage === stage).sort((a, b) => ORDER.indexOf(a.stage) - ORDER.indexOf(b.stage));

  return (
    <div>
      <PageHeader title="Life Threads" subtitle="Each unfinished situation in one place: what happened, what's next, and who you're waiting on." />
      <div role="group" aria-label="Filter threads" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip pressed={stage === "all"} onClick={() => setStage("all")}>
          All <span className="text-muted">{threads.length}</span>
        </Chip>
        {ORDER.map((s) => (
          <Chip key={s} pressed={stage === s} onClick={() => setStage(s)}>
            {STAGE_LABEL[s]} <span className="text-muted">{threads.filter((t) => t.stage === s).length}</span>
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No threads here" icon={<Icon.Thread />}>
            Start one from a brain dump, or check another filter.
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3.5 lg:grid-cols-2">
          {shown.map((t, i) => {
            const v = buildThreadView(t, src);
            const st = deriveThreadState(t, src.tasks, src.now);
            const I = Icon[t.icon];
            return (
              <li key={t.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <Link
                  href={`/threads/${t.id}`}
                  className="flex h-full flex-col gap-3 rounded-[22px] border border-line/70 bg-surface p-4 shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="flex items-start gap-3">
                    <span className="grid size-11 flex-none place-items-center rounded-2xl" style={{ background: `${t.color}1f`, color: t.color }}>
                      <I width={22} height={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <b className="font-display text-lg leading-tight font-semibold">{t.name}</b>
                        <StagePill stage={t.stage} />
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">{st.status}</span>
                    </span>
                  </span>
                  {t.stage !== "done" && (st.next || st.allDone) && (
                    <span className="rounded-2xl bg-surface-2 px-3 py-2 text-sm">
                      {st.allDone ? (
                        <>
                          <b className="font-semibold">All caught up.</b> Ready to wrap this up?
                        </>
                      ) : (
                        <>
                          <b className="font-semibold">Next:</b> {st.next!.label}
                        </>
                      )}
                    </span>
                  )}
                  {st.waitingOn && t.stage !== "done" && (
                    <span className="flex items-center gap-1.5 text-sm text-lavender">
                      <Icon.Clock width={16} height={16} /> Waiting on {st.waitingOn}
                    </span>
                  )}
                  <span className="mt-auto flex flex-wrap gap-3 text-xs text-muted">
                    {v.emails.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon.Mail width={14} height={14} /> {v.emails.length} email{v.emails.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {v.tasks.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon.Tasks width={14} height={14} /> {v.openTasks} open task{v.openTasks === 1 ? "" : "s"}
                      </span>
                    )}
                    {v.appointments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon.Calendar width={14} height={14} /> {v.appointments.length} appointment{v.appointments.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {v.upcoming.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Icon.Clock width={14} height={14} /> {v.upcoming.length} coming up
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
