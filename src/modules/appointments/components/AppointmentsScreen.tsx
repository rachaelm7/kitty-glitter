"use client";

import { useState } from "react";
import { addDays, formatDay, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { clearIntent, intentStore } from "@/core/store/intent";
import { Button, Chip, EmptyState, PageHeader, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { countByStatus, needsAttention, nextActions, stepIndex } from "../data/logic";
import { appointmentStore } from "../data/store";
import { STATUSES, STATUS_LABEL, type Status } from "../data/types";
import { AppointmentSheet, type SheetMode } from "./AppointmentSheet";
import { NotMedicalAdvice } from "./Disclaimer";
import { ProgressBar } from "./Progress";
import { StatusPill } from "./StatusPill";

export function AppointmentsScreen() {
  const now = useNow();
  const list = useStore(appointmentStore);
  const [filter, setFilter] = useState<Status | "all" | "attention">("all");
  const [localMode, setMode] = useState<SheetMode | null>(null);
  const intent = useStore(intentStore);
  // Search and Today can ask for a specific appointment, or the "new" form, without importing this screen.
  const mode: SheetMode | null = intent.create === "appointment" ? { kind: "new" } : intent.appointment ? { kind: "view", id: intent.appointment } : localMode;
  function changeMode(next: SheetMode | null) {
    if (intent.create === "appointment") clearIntent("create");
    if (intent.appointment) clearIntent("appointment");
    setMode(next);
  }
  const counts = countByStatus(list);
  const attention = list.filter(needsAttention);

  const shown = list
    .filter((a) => (filter === "all" ? true : filter === "attention" ? needsAttention(a) : a.status === filter))
    .sort((a, b) => Number(needsAttention(b)) - Number(needsAttention(a)) || stepIndex(a.status) - stepIndex(b.status));

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Referrals, bookings and follow-ups in one calm list.">
        <div className="mt-4">
          <Button onClick={() => changeMode({ kind: "new" })}>
            <Icon.Plus width={18} height={18} /> New appointment
          </Button>
        </div>
      </PageHeader>
      <div className="mt-5">
        <NotMedicalAdvice />
      </div>

      <div role="group" aria-label="Filter appointments" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip pressed={filter === "all"} onClick={() => setFilter("all")}>
          All <span className="text-muted">{list.length}</span>
        </Chip>
        <Chip pressed={filter === "attention"} onClick={() => setFilter("attention")}>
          <span className="size-2 rounded-full bg-urgent" aria-hidden /> Needs attention <span className="text-muted">{attention.length}</span>
        </Chip>
        {STATUSES.map((s) => (
          <Chip key={s} pressed={filter === s} onClick={() => setFilter(s)}>
            {STATUS_LABEL[s]} <span className="text-muted">{counts[s]}</span>
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-4">
          {list.length === 0 ? (
            <EmptyState title="No appointments yet" icon={<Icon.Stethoscope />}>
              Add a referral, visit or test to keep track of where it stands.
            </EmptyState>
          ) : (
            <EmptyState title="Nothing here" icon={<Icon.Stethoscope />}>
              No appointments with this status.
            </EmptyState>
          )}
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {shown.map((a) => {
            const first = nextActions(a)[0];
            const flag = needsAttention(a);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => changeMode({ kind: "view", id: a.id })}
                  className={cx(
                    "flex h-full w-full flex-col gap-2.5 rounded-[22px] border border-line/70 bg-surface shadow-soft p-4 text-left transition-colors hover:bg-surface-2/60",
                    flag && "border-l-4 border-l-urgent",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <b className="block font-semibold">{a.title}</b>
                      <span className="block truncate text-sm text-muted">{a.provider}</span>
                    </span>
                    <StatusPill status={a.status} attention={flag} />
                  </span>
                  <ProgressBar status={a.status} />
                  {a.when && a.status === "scheduled" && (
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon.Calendar width={16} height={16} /> {formatDay(addDays(now, a.when.dayOffset))}
                      {a.when.time && `, ${a.when.time}`}
                    </span>
                  )}
                  {first && (
                    <span className="text-sm text-muted">
                      <b className={cx("font-semibold", flag ? "text-urgent" : "text-ink")}>Next:</b> {first.text}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <AppointmentSheet mode={mode} list={list} onChange={changeMode} />
    </div>
  );
}
