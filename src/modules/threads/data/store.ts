"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_THREADS } from "./mock";
import type { LifeThread, ThreadNote } from "./types";

export const threadStore = createStore<LifeThread[]>("threads", SEED_THREADS);

const PALETTE = ["#2B7A74", "#7A6CC8", "#C98A1E", "#3E8FD1", "#A0728A"];

export function createThread(name: string): string {
  const clean = name.trim();
  const id = `t-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  threadStore.set((ts) => [...ts, { id, name: clean, color: PALETTE[ts.length % PALETTE.length], blurb: "Started from a brain dump", keywords: [] }]);
  return id;
}



export const threadNoteStore = createStore<ThreadNote[]>("thread-notes", []);

export function addThreadNote(threadId: string, text: string) {
  const clean = text.trim();
  if (!clean) return;
  threadNoteStore.set((ns) => [{ id: `n${Date.now().toString(36)}${ns.length}`, threadId, text: clean, createdAt: Date.now() }, ...ns]);
}
