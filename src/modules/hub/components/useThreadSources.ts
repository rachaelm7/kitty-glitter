"use client";

import { useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { appointmentStore } from "@/modules/appointments";
import { RENEWALS } from "@/modules/bills";
import { emailProvider } from "@/modules/email";
import { taskStore } from "@/modules/tasks";
import { threadNoteStore } from "@/modules/threads";
import { tripStore } from "@/modules/travel";
import type { ThreadSources } from "../data/threadView";

export function useThreadSources(): ThreadSources {
  return {
    messages: emailProvider.listMessages(),
    tasks: useStore(taskStore),
    appointments: useStore(appointmentStore),
    trips: useStore(tripStore),
    renewals: RENEWALS,
    notes: useStore(threadNoteStore),
    now: useNow(),
  };
}
