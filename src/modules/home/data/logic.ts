import type { Coverage, MaintenanceItem } from "./types";

export type DueState = "overdue" | "soon" | "ok";

/** Next due date is computed from the last time it was done; nothing is guessed. */
export function nextDue(m: MaintenanceItem) {
  const offset = m.lastDoneOffset + m.everyDays;
  const state: DueState = offset < 0 ? "overdue" : offset <= 14 ? "soon" : "ok";
  return { offset, state };
}

export function sortMaintenance(items: MaintenanceItem[]) {
  return [...items].sort((a, b) => nextDue(a).offset - nextDue(b).offset);
}

export function coverageState(c: Coverage): DueState {
  return c.endsOffset < 0 ? "overdue" : c.endsOffset <= 30 ? "soon" : "ok";
}
