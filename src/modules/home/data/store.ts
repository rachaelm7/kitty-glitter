"use client";

import { createStore } from "@/core/store/createStore";
import { SEED_COVERAGE, SEED_MAINTENANCE } from "./mock";
import type { MaintenanceItem } from "./types";

export const maintenanceStore = createStore<MaintenanceItem[]>("home-maintenance", SEED_MAINTENANCE);
export const coverage = SEED_COVERAGE;

export function markDone(id: string) {
  maintenanceStore.set((ms) => ms.map((m) => (m.id === id ? { ...m, lastDoneOffset: 0 } : m)));
}
