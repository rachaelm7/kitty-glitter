"use client";

import { createStore } from "@/core/store/createStore";
import type { CleanupChoice } from "./types";
import { defaultPlan, type Plan } from "./rescue";
import type { InboxState } from "./logic";

/** Per-sender cleanup choices. Choosing never changes any mailbox. */
export const cleanupStore = createStore<Record<string, CleanupChoice | undefined>>("email-cleanup", {});

/** Edited reply drafts, keyed by message id. Drafts are never sent. */
export const draftStore = createStore<Record<string, string>>("email-drafts", {});

/** Rescue Mode plan: one simulated action per pile. */
export const rescuePlanStore = createStore<Plan>("email-rescue-plan", defaultPlan());

/** Read/unread and simulated archive state. Changes nothing in any mailbox. */
export const inboxStateStore = createStore<InboxState>("email-state", { read: {}, archived: {} });

export function markRead(id: string, read = true) {
  inboxStateStore.set((s) => ({ ...s, read: { ...s.read, [id]: read } }));
}

export function setArchived(id: string, archived: boolean) {
  inboxStateStore.set((s) => {
    const next = { ...s.archived };
    if (archived) next[id] = true;
    else delete next[id];
    return { ...s, archived: next };
  });
}
