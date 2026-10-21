"use client";

import { createStore } from "@/core/store/createStore";

const MAX_RECENT = 5;

/** Ids of the last results you opened (never what you typed), newest first. */
export const recentStore = createStore<string[]>("search-recent", [], 1);

export function pushRecent(id: string) {
  recentStore.set((ids) => [id, ...ids.filter((x) => x !== id)].slice(0, MAX_RECENT));
}
