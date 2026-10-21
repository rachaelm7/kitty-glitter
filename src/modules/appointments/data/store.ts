"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_APPOINTMENTS } from "./mock";
import type { Appointment, Status } from "./types";

export const appointmentStore = createStore<Appointment[]>("appointments", SEED_APPOINTMENTS);

/** Records your own status update. Nothing is sent to any office. */
export function setStatus(id: string, status: Status, label: string) {
  appointmentStore.set((list) =>
    list.map((a) =>
      a.id === id && a.status !== status
        ? {
            ...a,
            status,
            statusSince: 0,
            events: [...a.events, { id: `u${Date.now().toString(36)}`, dayOffset: 0, label, by: "you" as const }],
          }
        : a,
    ),
  );
}
