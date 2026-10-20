export type NeedItem = { id: string; title: string; who: string; when: string };

const NUMBER = ["Nothing", "One thing", "Two things", "Three things"];

/** Rule-based stand-in for the AI morning brief. Uses only the given items. */
export function composeBrief(open: NeedItem[], meetings: number): string {
  if (open.length === 0) {
    return meetings
      ? `Nothing urgent is waiting on you. You have ${meetings} thing${meetings > 1 ? "s" : ""} on the calendar today.`
      : "Nothing urgent is waiting on you. Enjoy a quiet day.";
  }
  const list = open.map((n) => n.title.charAt(0).toLowerCase() + n.title.slice(1));
  const joined = list.length === 1 ? list[0] : `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
  return `${NUMBER[Math.min(open.length, 3)]} need${open.length === 1 ? "s" : ""} you: ${joined}. Everything else can wait.`;
}
