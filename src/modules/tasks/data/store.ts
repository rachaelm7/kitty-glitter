"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_TASKS } from "./mock";
import { completeInList, openLinked, reopenInList } from "./recur";
import type { Task, TaskCategory } from "./types";

// v3: tasks gained repeats and links to Home upkeep.
export const taskStore = createStore<Task[]>("tasks", SEED_TASKS, 3);

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
  taskStore.set((ts) => {
    const t = ts.find((x) => x.id === id);
    if (!t) return ts;
    const { status, ...rest } = patch;
    let list = ts.map((x) => (x.id === id ? { ...x, ...rest } : x));
    if (status && status !== t.status) {
      if (status === "done") list = completeInList(list, id, new Date(), newTaskId());
      else if (t.status === "done") list = reopenInList(list, id, status);
      else list = list.map((x) => (x.id === id ? { ...x, status } : x));
    }
    return list;
  });
}

export function toggleTask(id: string) {
  taskStore.set((ts) => {
    const t = ts.find((x) => x.id === id);
    if (!t) return ts;
    return t.status === "done" ? reopenInList(ts, id) : completeInList(ts, id, new Date(), newTaskId());
  });
}

/**
 * Finish the open task tied to an upkeep item (e.g. from Home → "Mark done").
 * Returns the ids it completed, so the caller can offer Undo.
 */
export function completeLinkedTasks(kind: "maintenance", id: string): string[] {
  const ids = openLinked(taskStore.get(), kind, id).map((t) => t.id);
  ids.forEach((taskId) => taskStore.set((ts) => completeInList(ts, taskId, new Date(), newTaskId())));
  return ids;
}

export function removeTask(id: string) {
  taskStore.set((ts) => ts.filter((t) => t.id !== id));
}
