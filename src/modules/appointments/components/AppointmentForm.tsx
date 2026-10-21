"use client";

import { useState } from "react";
import { addDays, offsetOfISO, toISODate, useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { Button, Segmented } from "@/core/ui/primitives";
import { Field, inputClass } from "@/core/ui/fields";
import { useToast } from "@/core/ui/Toast";
import { threadStore } from "@/modules/threads";
import { validateAppointment, type DraftErrors } from "../data/logic";
import { addAppointment, removeAppointment, updateAppointment, type AppointmentInput } from "../data/store";
import { STATUSES, STATUS_LABEL, type Appointment, type Status } from "../data/types";

/** Add or edit an appointment. Everything stays on this device; nothing is booked or sent. */
export function AppointmentForm({ appt, onDone }: { appt?: Appointment; onDone: (savedId?: string) => void }) {
  const now = useNow();
  const toast = useToast();
  const threads = useStore(threadStore);

  const [title, setTitle] = useState(appt?.title ?? "");
  const [kind, setKind] = useState<Appointment["kind"]>(appt?.kind ?? "visit");
  const [provider, setProvider] = useState(appt?.provider ?? "");
  const [contact, setContact] = useState(appt?.contact ?? "");
  const [status, setStatus] = useState<Status>(appt?.status ?? "needs-scheduling");
  const [date, setDate] = useState(appt?.when ? toISODate(addDays(now, appt.when.dayOffset)) : "");
  const [time, setTime] = useState(appt?.when?.time ?? "");
  const [place, setPlace] = useState(appt?.when?.place ?? "");
  const [referredBy, setReferredBy] = useState(appt?.referredBy ?? "");
  const [threadId, setThreadId] = useState(appt?.threadId ?? "");
  // Errors appear after the first save attempt, then update as you type.
  const [tried, setTried] = useState(false);
  const errors: DraftErrors = tried ? validateAppointment({ title, provider, status, date, time }) : {};

  function save() {
    const found = validateAppointment({ title, provider, status, date, time });
    setTried(true);
    if (Object.keys(found).length) {
      document.getElementById(`appt-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    const input: AppointmentInput = {
      title: title.trim(),
      kind,
      provider: provider.trim(),
      contact: contact.trim(),
      status,
      when: date ? { dayOffset: offsetOfISO(date, now), time: time.trim(), place: place.trim() || provider.trim() } : undefined,
      referredBy: referredBy.trim() || undefined,
      threadId: threadId || undefined,
    };
    if (appt) {
      updateAppointment(appt.id, input);
      toast("Appointment updated");
      onDone(appt.id);
    } else {
      const id = addAppointment(input);
      toast("Appointment added");
      onDone(id);
    }
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h3 className="pr-12 text-xl">{appt ? "Edit appointment" : "New appointment"}</h3>
      <p className="mt-1 text-sm text-muted">This only updates your own tracker. Nothing is booked or sent.</p>

      <div className="mt-4 grid gap-4">
        <Field id="appt-title" label="What is it?" error={errors.title}>
          {(a) => <input {...a} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dental cleaning" className={inputClass} />}
        </Field>

        <div>
          <p className="mb-1 text-sm font-semibold">Type</p>
          <Segmented<Appointment["kind"]>
            label="Type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "visit", label: "Visit" },
              { value: "referral", label: "Referral" },
              { value: "test", label: "Test" },
            ]}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="appt-provider" label="Office or provider" error={errors.provider}>
            {(a) => <input {...a} value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Harbor Smiles Dental" className={inputClass} />}
          </Field>
          <Field id="appt-contact" label="Phone" optional>
            {(a) => <input {...a} type="tel" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="555-0100" className={inputClass} />}
          </Field>
        </div>

        <Field id="appt-status" label="Where it stands">
          {(a) => (
            <select {...a} value={status} onChange={(e) => setStatus(e.target.value as Status)} className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="appt-date" label="Date" optional={status !== "scheduled"} error={errors.date}>
            {(a) => <input {...a} type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />}
          </Field>
          <Field id="appt-time" label="Time" optional>
            {(a) => <input {...a} value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 3:30 PM" className={inputClass} />}
          </Field>
        </div>
        {date && (
          <Field id="appt-place" label="Where" optional hint="Leave blank to use the office name.">
            {(a) => <input {...a} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="e.g. 2nd floor, suite 210" className={inputClass} />}
          </Field>
        )}

        {kind === "referral" && (
          <Field id="appt-referred" label="Referred by" optional>
            {(a) => <input {...a} value={referredBy} onChange={(e) => setReferredBy(e.target.value)} placeholder="e.g. Maple Grove Family Clinic" className={inputClass} />}
          </Field>
        )}

        <Field id="appt-thread" label="Life Thread" optional>
          {(a) => (
            <select {...a} value={threadId} onChange={(e) => setThreadId(e.target.value)} className={inputClass}>
              <option value="">None</option>
              {threads.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="submit">{appt ? "Save changes" : "Add appointment"}</Button>
        <Button variant="ghost" onClick={() => onDone(appt?.id)}>
          Cancel
        </Button>
        {appt && (
          <Button
            variant="quiet"
            className="ml-auto text-urgent hover:bg-urgent-soft"
            onClick={() => {
              const undo = removeAppointment(appt.id);
              onDone();
              toast("Appointment deleted", { label: "Undo", onClick: undo });
            }}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
