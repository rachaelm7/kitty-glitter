"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_APPOINTMENTS } from "./mock";
import type { Appointment, Status } from "./types";

export const appointmentStore = createStore<Appointment[]>("appointments", SEED_APPOINTMENTS, 1, {
  shift: (list, d) =>
    list.map((a) => ({
      ...a,
      statusSince: a.statusSince + d,
      events: a.events.map((e) => ({ ...e, dayOffset: e.dayOffset + d })),
      ...(a.when && { when: { ...a.when, dayOffset: a.when.dayOffset + d } }),
    })),
});

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Records your own status update. Nothing is sent to any office. */
export function setStatus(id: string, status: Status, label: string) {
  appointmentStore.set((list) =>
    list.map((a) =>
      a.id === id && a.status !== status
        ? {
            ...a,
            status,
            statusSince: 0,
            events: [...a.events, { id: uid("u"), dayOffset: 0, label, by: "you" as const }],
          }
        : a,
    ),
  );
}

export type AppointmentInput = Omit<Appointment, "id" | "events" | "statusSince">;

export function addAppointment(input: AppointmentInput): string {
  const id = uid("ap");
  appointmentStore.set((list) => [{ ...input, id, statusSince: 0, events: [{ id: uid("u"), dayOffset: 0, label: "You added this", by: "you" }] }, ...list]);
  return id;
}

/** Edits details. A status change through here is logged on the timeline like any other. */
export function updateAppointment(id: string, patch: Partial<AppointmentInput>) {
  appointmentStore.set((list) =>
    list.map((a) => {
      if (a.id !== id) return a;
      const next = { ...a, ...patch };
      if (patch.status && patch.status !== a.status) {
        next.statusSince = 0;
        next.events = [...a.events, { id: uid("u"), dayOffset: 0, label: "You updated the status", by: "you" }];
      }
      return next;
    }),
  );
}

export function removeAppointment(id: string): () => void {
  const list = appointmentStore.get();
  const index = list.findIndex((a) => a.id === id);
  if (index < 0) return () => {};
  const removed = list[index];
  appointmentStore.set((l) => l.filter((a) => a.id !== id));
  return () => appointmentStore.set((l) => (l.some((a) => a.id === id) ? l : [...l.slice(0, index), removed, ...l.slice(index)]));
}
