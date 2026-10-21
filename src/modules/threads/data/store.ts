"use client";

import { createStore, shiftChanged } from "@/core/store/createStore";
import { SEED_THREADS } from "./mock";
import type { LifeThread, ThreadNote } from "./types";

// v2: threads gained status, stage, next step and timeline.
export const threadStore = createStore<LifeThread[]>("threads", SEED_THREADS, 2, {
  shift: shiftChanged(SEED_THREADS, (t, d) => ({ ...t, events: t.events.map((e) => ({ ...e, dayOffset: e.dayOffset + d })) })),
});
export const threadNoteStore = createStore<ThreadNote[]>("thread-notes", [], 2);

const PALETTE = ["#9A515D", "#6F5FA0", "#9A7A3F", "#4E7F8C", "#A85F7A"];

export function createThread(name: string): string {
  const clean = name.trim();
  const id = `t-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  threadStore.set((ts) => [
    ...ts,
    { id, name: clean, color: PALETTE[ts.length % PALETTE.length], icon: "Thread", blurb: "Started from a brain dump", status: "New", stage: "action", events: [], keywords: [] },
  ]);
  return id;
}

export function updateThread(id: string, patch: Partial<LifeThread>) {
  threadStore.set((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
}

export function addThreadNote(threadId: string, text: string) {
  const clean = text.trim();
  if (!clean) return;
  threadNoteStore.set((ns) => [{ id: `n${Date.now().toString(36)}${ns.length}`, threadId, text: clean, createdAt: Date.now() }, ...ns]);
}

export function removeThreadNote(id: string) {
  threadNoteStore.set((ns) => ns.filter((n) => n.id !== id));
}
