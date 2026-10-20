"use client";

import { createStore } from "./createStore";

/**
 * Cross-screen "open this" requests (e.g. Today → a specific email), so
 * modules can link to each other without importing each other.
 * Kept in memory only.
 */
export type Intent = { email?: string; task?: string };
export const intentStore = createStore<Intent>("intent", {}, 1, { persist: false });

export function requestOpen(intent: Intent) {
  intentStore.set(intent);
}

export function clearIntent(key: keyof Intent) {
  intentStore.set((i) => {
    const next = { ...i };
    delete next[key];
    return next;
  });
}
