"use client";

import { createStore } from "@/core/store/createStore";
import { completeLinkedTasks, toggleTask } from "@/modules/tasks";
import { toISODate } from "@/core/date";
import { SEED_COVERAGE, SEED_MAINTENANCE } from "./mock";
import type { MaintenanceItem } from "./types";

export const maintenanceStore = createStore<MaintenanceItem[]>("home-maintenance", SEED_MAINTENANCE, 1, {
  shift: (ms, d) => ms.map((m) => ({ ...m, lastDoneOffset: m.lastDoneOffset + d })),
});
export const coverage = SEED_COVERAGE;

/**
 * Mark an upkeep item done. If a task on your list is tied to it, that task is
 * completed (and its next occurrence is created) so both screens agree.
 * Returns an undo function.
 */
export function markDone(id: string): () => void {
  const completed = completeLinkedTasks("maintenance", id);
  if (completed.length > 0) return () => completed.forEach((taskId) => toggleTask(taskId));
  const before = maintenanceStore.get().find((m) => m.id === id)?.lastDoneDate;
  maintenanceStore.set((ms) => ms.map((m) => (m.id === id ? { ...m, lastDoneDate: toISODate(new Date()) } : m)));
  return () => maintenanceStore.set((ms) => ms.map((m) => (m.id === id ? { ...m, lastDoneDate: before } : m)));
}
