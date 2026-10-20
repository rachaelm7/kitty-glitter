"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_TASKS } from "./mock";
import type { Task } from "./types";

export const taskStore = createStore<Task[]>("tasks", SEED_TASKS);

let counter = 0;
export function newTaskId() {
  counter += 1;
  return `k${Date.now().toString(36)}${counter}`;
}

export function addTask(input: Omit<Task, "id" | "done" | "createdAt">) {
  const title = input.title.trim();
  if (!title) return;
  taskStore.set((ts) => [{ ...input, title, id: newTaskId(), done: false, createdAt: Date.now() }, ...ts]);
}

export function toggleTask(id: string) {
  taskStore.set((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
}

export function removeTask(id: string) {
  taskStore.set((ts) => ts.filter((t) => t.id !== id));
}

/** Open tasks first (newest first), then done ones. */
export function sortTasks(ts: Task[]) {
  return [...ts].sort((a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt);
}
