"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_TASKS } from "./mock";
import type { Task, TaskCategory } from "./types";

// v2: tasks gained status, categories and links.
export const taskStore = createStore<Task[]>("tasks", SEED_TASKS, 2);

let counter = 0;
export function newTaskId() {
  counter += 1;
  return `k${Date.now().toString(36)}${counter}`;
}

export type NewTask = Partial<Omit<Task, "id" | "createdAt">> & { title: string; category?: TaskCategory };

export function addTask(input: NewTask): string | undefined {
  const title = input.title.trim();
  if (!title) return undefined;
  const id = newTaskId();
  const createdAt = Date.now();
  taskStore.set((ts) => [{ status: "open", category: "Errands", ...input, title, id, createdAt, ...(input.status === "done" ? { completedAt: createdAt } : {}) } as Task, ...ts]);
  return id;
}

export function updateTask(id: string, patch: Partial<Task>) {
  taskStore.set((ts) =>
    ts.map((t) => {
      if (t.id !== id) return t;
      const next = { ...t, ...patch };
      if (next.status === "done" && t.status !== "done") next.completedAt = Date.now();
      if (next.status !== "done") next.completedAt = undefined;
      return next;
    }),
  );
}

export function toggleTask(id: string) {
  taskStore.set((ts) =>
    ts.map((t) =>
      t.id === id ? (t.status === "done" ? { ...t, status: "open", completedAt: undefined } : { ...t, status: "done", completedAt: Date.now() }) : t,
    ),
  );
}

export function removeTask(id: string) {
  taskStore.set((ts) => ts.filter((t) => t.id !== id));
}
