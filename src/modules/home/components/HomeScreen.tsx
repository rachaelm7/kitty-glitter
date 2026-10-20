"use client";

import { addDays, formatDay, untilLabel, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Button, Card, CheckCircle, PageHeader, Section, Tag, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { sortTasks, taskStore, toggleTask } from "@/modules/tasks";
import { ThreadTag } from "@/modules/threads";
import { coverageState, nextDue, sortMaintenance, type DueState } from "../data/logic";
import { coverage, maintenanceStore, markDone } from "../data/store";

const STATE_LABEL: Record<DueState, string> = { overdue: "Overdue", soon: "Due soon", ok: "On track" };

export function HomeScreen() {
  const now = useNow();
  const toast = useToast();
  const items = sortMaintenance(useStore(maintenanceStore));
  const tasks = sortTasks(useStore(taskStore)).filter((t) => t.threadId === "t-house");
  const attention = items.filter((m) => nextDue(m).state !== "ok").length;

  return (
    <div>
      <PageHeader title="Home" subtitle="Upkeep, insurance and warranties, without the mental load." />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ThreadTag id="t-house" />
        <ThreadTag id="t-car" />
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <Section title="Maintenance" id="maintenance" action={<span className="text-sm text-muted">{attention} need attention</span>}>
          <ul className="space-y-2.5">
            {items.map((m) => {
              const due = nextDue(m);
              return (
                <li
                  key={m.id}
                  className={cx("rounded-2xl border border-line bg-surface p-4", due.state === "overdue" && "border-l-4 border-l-urgent")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold tracking-wide text-muted uppercase">{m.area}</p>
                      <b className="block font-semibold">{m.title}</b>
                      <p className="text-sm text-muted">
                        Every {m.everyDays} days · last done {m.lastDoneOffset === 0 ? "today" : `${-m.lastDoneOffset} days ago`}
                      </p>
                      {m.how && <p className="mt-1 text-sm">{m.how}</p>}
                    </div>
                    <span className="flex flex-none flex-col items-end gap-1">
                      <Tag tone={due.state === "overdue" ? "urgent" : due.state === "soon" ? "accent" : "neutral"}>{STATE_LABEL[due.state]}</Tag>
                      <span className="text-xs text-muted">{due.offset < 0 ? `${-due.offset}d late` : untilLabel(due.offset)}</span>
                    </span>
                  </div>
                  {due.state !== "ok" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-3"
                      onClick={() => {
                        markDone(m.id);
                        toast(`${m.title}: marked done`);
                      }}
                    >
                      <Icon.Check width={16} height={16} /> Mark done
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Section>

        <div>
          <Section title="Insurance & warranties" id="coverage">
            <Card className="py-1">
              <ul>
                {[...coverage].sort((a, b) => a.endsOffset - b.endsOffset).map((c) => {
                  const st = coverageState(c);
                  return (
                    <li key={c.id} className="border-b border-line py-3 last:border-b-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <b className="block font-semibold">{c.title}</b>
                          <p className="text-sm text-muted">
                            {c.provider}
                            {c.amount && ` · ${c.amount}`}
                          </p>
                          <p className="text-sm">{c.note}</p>
                        </div>
                        <span className="flex flex-none flex-col items-end gap-1">
                          <b className="text-sm font-semibold">{formatDay(addDays(now, c.endsOffset))}</b>
                          <Tag tone={st === "soon" ? "urgent" : "neutral"}>
                            {c.kind === "insurance" ? "Renews" : "Ends"} {untilLabel(c.endsOffset)}
                          </Tag>
                        </span>
                      </div>
                      {c.threadId && (
                        <div className="mt-2">
                          <ThreadTag id={c.threadId} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Section>

          {tasks.length > 0 && (
            <Section title="Home tasks" id="home-tasks">
              <Card className="py-1">
                <ul>
                  {tasks.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
                      <CheckCircle checked={t.done} onToggle={() => toggleTask(t.id)} label={`Done: ${t.title}`} />
                      <span className={cx(t.done && "text-muted line-through")}>{t.title}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
