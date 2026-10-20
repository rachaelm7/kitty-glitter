// Public API of the calendar module (sample agenda only for now).
export { AGENDA } from "./data/mock";
export type { AgendaItem } from "./data/mock";

export function formatTime(hour: number, minute: number) {
  const h = hour % 12 || 12;
  return `${h}:${String(minute).padStart(2, "0")}${hour < 12 ? " AM" : " PM"}`;
}
