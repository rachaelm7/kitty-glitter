"use client";

import { useStore } from "@/core/store/createStore";
import { inboxStateStore } from "@/modules/email";
import { threadStore } from "@/modules/threads";
import { buildChanges, summarizeChanges } from "../data/changes";
import { useThreadSources } from "./useThreadSources";

/** What changed since yesterday, plus a one-line summary for the morning brief. */
export function useChanges() {
  const src = useThreadSources();
  const inbox = useStore(inboxStateStore);
  const threads = useStore(threadStore);
  const changes = buildChanges({ messages: src.messages, inbox, tasks: src.tasks, appointments: src.appointments, threads, now: src.now });
  return { changes, summary: summarizeChanges(changes) };
}
