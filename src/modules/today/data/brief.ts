export type NeedItem = { id: string; title: string; who: string; when: string; briefLine?: string; threadId?: string };

const COUNT = ["nothing", "one thing", "two things", "three things"];

/** Rule-based stand-in for the AI morning brief. Uses only the given items, never invents. */
export function composeBrief(open: NeedItem[], appointmentsToday: number): string {
  if (open.length === 0) {
    return appointmentsToday
      ? `Nothing urgent is waiting on you. You have ${appointmentsToday} thing${appointmentsToday > 1 ? "s" : ""} on the calendar, and that's it.`
      : "Nothing urgent is waiting on you. Enjoy a quiet day.";
  }
  const lines = open.map((n) => n.briefLine ?? n.title.charAt(0).toLowerCase() + n.title.slice(1));
  const joined = lines.length === 1 ? lines[0] : `${lines.slice(0, -1).join(", ")}, and ${lines[lines.length - 1]}`;
  const sentence = joined.charAt(0).toUpperCase() + joined.slice(1);
  return `You have ${COUNT[Math.min(open.length, 3)]} worth your attention today. ${sentence}. Everything else can wait.`;
}
