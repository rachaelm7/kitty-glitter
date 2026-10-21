export type AgendaItem = { id: string; hour: number; minute: number; title: string; where?: string; threadId?: string };

// A fictional weekday.
export const AGENDA: AgendaItem[] = [
  { id: "a1", hour: 9, minute: 0, title: "Team check-in", where: "Video call" },
  { id: "a2", hour: 11, minute: 30, title: "Review candidate shortlist" },
  { id: "a3", hour: 13, minute: 0, title: "Lunch, protected time" },
  { id: "a4", hour: 15, minute: 30, title: "Focus block: Q4 plan" },
  { id: "a5", hour: 18, minute: 0, title: "Pottery class", where: "Clayworks Studio" },
];
