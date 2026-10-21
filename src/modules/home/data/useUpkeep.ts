"use client";

import { useNow } from "@/core/date";
import { useStore } from "@/core/store/createStore";
import { taskStore } from "@/modules/tasks";
import { nextDue, sortMaintenance } from "./logic";
import { maintenanceStore } from "./store";

/** Upkeep items with their live due state, most pressing first. Reads your Tasks too. */
export function useUpkeep() {
  const now = useNow();
  const items = useStore(maintenanceStore);
  const tasks = useStore(taskStore);
  return sortMaintenance(items, now, tasks).map((m) => ({ m, due: nextDue(m, now, tasks), task: tasks.find((t) => t.status !== "done" && t.linkedTo?.id === m.id) }));
}
