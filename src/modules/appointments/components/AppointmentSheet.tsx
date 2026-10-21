"use client";

import { useState } from "react";
import { formatDay, addDays, relativeDay, useNow } from "@/core/date";
import { Sheet } from "@/core/ui/Sheet";
import { Button, cx } from "@/core/ui/primitives";
import { Icon } from "@/core/ui/icons";
import { useToast } from "@/core/ui/Toast";
import { nextActions, officeDraft } from "../data/logic";
import { setStatus } from "../data/store";
import { STATUSES, STATUS_LABEL, type Appointment } from "../data/types";
import { AppointmentForm } from "./AppointmentForm";
import { NotMedicalAdvice } from "./Disclaimer";
import { Stepper } from "./Progress";
import { StatusPill } from "./StatusPill";

export type SheetMode = { kind: "view"; id: string } | { kind: "edit"; id: string } | { kind: "new" };

export function AppointmentSheet({
  mode,
  list,
  onChange,
}: {
  mode: SheetMode | null;
  list: Appointment[];
  onChange: (next: SheetMode | null) => void;
}) {
  const appt = mode && mode.kind !== "new" ? list.find((a) => a.id === mode.id) : undefined;
  const open = mode?.kind === "new" || !!appt;
  const close = () => onChange(null);
  return (
    <Sheet open={open} onClose={close} title={mode?.kind === "new" ? "New appointment" : (appt?.title ?? "Appointment")}>
      {mode?.kind === "new" && <AppointmentForm key="new" onDone={(id) => onChange(id ? { kind: "view", id } : null)} />}
      {mode?.kind === "edit" && appt && <AppointmentForm key={`edit-${appt.id}`} appt={appt} onDone={(id) => onChange(id ? { kind: "view", id } : null)} />}
      {mode?.kind === "view" && appt && <Detail key={appt.id + appt.status} a={appt} onEdit={() => onChange({ kind: "edit", id: appt.id })} />}
    </Sheet>
  );
}

function Detail({ a, onEdit }: { a: Appointment; onEdit: () => void }) {
  const now = useNow();
  const toast = useToast();
  const actions = nextActions(a);
  const contact = a.contact ? <span className="text-muted">{a.contact}</span> : null;
  const [draft, setDraft] = useState(() => officeDraft(a));

  return (
    <div>
      <p className="text-sm text-muted">{a.kind === "referral" ? "Referral" : a.kind === "test" ? "Test" : "Visit"}</p>
      <h3 className="pr-12 text-xl leading-snug">{a.title}</h3>
      <p className="mt-1 text-sm">
        {a.provider}
        {contact && <> · {contact}</>}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <StatusPill status={a.status} attention={actions.some((x) => x.urgent)} />
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Icon.Pencil width={16} height={16} /> Edit details
        </Button>
      </div>
      {a.when && (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <Icon.Calendar width={18} height={18} /> {formatDay(addDays(now, a.when.dayOffset))}
          {a.when.time && ` at ${a.when.time}`} · {a.when.place}
        </p>
      )}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-[15px] font-bold">Where it stands</h4>
          <Stepper status={a.status} />
        </div>
        <div>
          <h4 className="mb-2 text-[15px] font-bold">Suggested next steps</h4>
          {actions.length ? (
            <ul className="space-y-2">
              {actions.map((n) => (
                <li key={n.text} className={cx("rounded-xl p-3 text-sm", n.urgent ? "bg-urgent-soft" : "bg-surface-2")}>
                  {n.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Nothing left to do. Nicely done.</p>
          )}
        </div>
      </div>

      <h4 className="mt-6 mb-2 text-[15px] font-bold">Timeline</h4>
      <ol className="space-y-2.5">
        {[...a.events].reverse().map((e) => (
          <li key={e.id} className="flex gap-3 text-sm">
            <span className="w-20 flex-none text-muted">{relativeDay(e.dayOffset, now)}</span>
            <span>
              {e.label} <span className="text-muted">· {e.by === "you" ? "you" : e.by === "office" ? "office" : "app"}</span>
            </span>
          </li>
        ))}
      </ol>

      <h4 className="mt-6 mb-2 text-[15px] font-bold">Update status</h4>
      <div role="radiogroup" aria-label="Status" className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={a.status === s}
            onClick={() => {
              setStatus(a.id, s, `You marked this as ${STATUS_LABEL[s]}`);
              toast(`Marked as ${STATUS_LABEL[s]}`);
            }}
            className={cx(
              "min-h-10 rounded-xl border-[1.5px] px-2 text-[13px] font-semibold",
              a.status === s ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2",
            )}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[13px] text-muted">This only updates your own tracker.</p>

      {a.status !== "completed" && (
        <>
          <h4 className="mt-6 mb-2 text-[15px] font-bold">Message to the office (draft)</h4>
          <label htmlFor={`office-${a.id}`} className="sr-only">
            Draft message to the office
          </label>
          <textarea
            id={`office-${a.id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-36 w-full resize-y rounded-2xl border-[1.5px] border-line bg-bg p-3 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <Button onClick={() => navigator.clipboard?.writeText(draft).then(() => toast("Draft copied"), () => toast("Select the text to copy it"))}>
              Copy draft
            </Button>
            <Button variant="ghost" disabled>
              Send
            </Button>
          </div>
        </>
      )}

      <div className="mt-6">
        <NotMedicalAdvice compact />
      </div>
    </div>
  );
}
