/**
 * Rule-based Brain Dump parser. No AI, no network: it splits a ramble into
 * suggestions and only attaches a date when the words say one explicitly.
 * Vague timing ("next week", "soon") becomes a hint, never a due date.
 */

export type SuggestionKind = "task" | "reminder" | "note";

export type Suggestion = {
  id: string;
  source: string; // the words this came from
  title: string;
  kind: SuggestionKind;
  due?: { dayOffset: number; phrase: string };
  timeHint?: string;
  threadId?: string;
};

export type ThreadLike = { id: string; keywords: string[] };

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const NUMBERS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, ten: 10, a: 1 };

const ACTION_VERB =
  "call|email|text|book|buy|pay|schedule|renew|pick up|order|fix|clean|pack|reply|confirm|cancel|return|send|make|find|ask|check|look into|sign up|register|print|drop off|get|update|submit|research|plan|write|water|feed|wash";

const REMINDER = /\b(remind me|don'?t forget|remember to|reminder)\b/i;
const TASK_START = new RegExp(`^(?:${ACTION_VERB})\\b`, "i");
const TASK_ANY = /\b(need to|needs to|have to|has to|gotta|got to|should|must|to-?do)\b/i;

const LEAD_FILLERS =
  /^(?:(?:um+|uh+|so|okay|ok|oh|and|also|plus|then|well|like|maybe|probably|i think|honestly|oh and|and also|and then)[,\s]+)+/i;
const LEAD_INTENT =
  /^(?:i\s+)?(?:really\s+)?(?:need to|needs to|have to|gotta|got to|should|must|want to|wanna|'ve got to|remind me to|don'?t forget to|remember to|don'?t let me forget to)\s+/i;
const VAGUE = /\b(next week|this weekend|next weekend|soon|sometime|someday|end of (?:the )?(?:month|week)|later this (?:week|month)|before the trip)\b/i;

// "Schedule X, order Y, and check Z" → three thoughts (only when each part starts with an action verb).
const LIST_SPLIT = new RegExp(`,\\s*(?:and\\s+)?(?=(?:${ACTION_VERB})\\b)`, "i");

export function splitThoughts(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?])\s+|;\s*|,?\s+(?:and also|oh and|and then|also)\s+/i)
    .flatMap((s) => s.split(LIST_SPLIT))
    .map((s) => s.trim().replace(/^[-•*]\s*/, "").replace(/^(?:and also|oh and|and then|also|and)\s+/i, ""))
    .filter((s) => s.replace(/[^a-z]/gi, "").length >= 4);
}

export function findDate(fragment: string, now: Date): { dayOffset: number; phrase: string } | undefined {
  const f = fragment.toLowerCase();

  let m = f.match(/\b(today|tonight|this evening)\b/);
  if (m) return { dayOffset: 0, phrase: m[0] };
  m = f.match(/\b(tomorrow)\b/);
  if (m) return { dayOffset: 1, phrase: m[0] };

  m = f.match(/\bin (\d+|one|two|three|four|five|six|seven|ten|a) days?\b/);
  if (m) {
    const n = /^\d+$/.test(m[1]) ? Number(m[1]) : NUMBERS[m[1]];
    if (n) return { dayOffset: n, phrase: m[0] };
  }

  m = f.match(/\b(?:(on|by|this|before|next)\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (m) {
    const target = WEEKDAYS.indexOf(m[2]);
    let diff = (target - now.getDay() + 7) % 7;
    if (diff === 0) diff = 7; // "Friday" said on a Friday means next Friday
    if (m[1] === "next" && diff < 7) diff += 7;
    return { dayOffset: diff, phrase: m[0] };
  }

  m = f.match(/\b(?:on |by )?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.? (\d{1,2})(?:st|nd|rd|th)?\b/);
  if (m) {
    const month = MONTHS.indexOf(m[1].slice(0, 3));
    const day = Number(m[2]);
    if (day >= 1 && day <= 31) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let d = new Date(now.getFullYear(), month, day);
      if (d < start) d = new Date(now.getFullYear() + 1, month, day);
      return { dayOffset: Math.round((d.getTime() - start.getTime()) / 86_400_000), phrase: m[0] };
    }
  }
  return undefined;
}

function classify(fragment: string): SuggestionKind {
  if (REMINDER.test(fragment)) return "reminder";
  const body = fragment.replace(LEAD_FILLERS, "");
  if (TASK_ANY.test(body) || TASK_START.test(body)) return "task";
  return "note";
}

export function cleanTitle(fragment: string, datePhrase?: string): string {
  let t = fragment.trim().replace(LEAD_FILLERS, "");
  t = t.replace(LEAD_INTENT, "");
  t = t.replace(/^(?:i\s+)?(?:need|have)\s+/i, (s) => (/(need|have) to/i.test(s) ? "" : s));
  if (datePhrase) {
    const idx = t.toLowerCase().lastIndexOf(datePhrase);
    if (idx > 0) t = (t.slice(0, idx) + t.slice(idx + datePhrase.length)).replace(/\s{2,}/g, " ");
  }
  t = t.replace(/[\s,.!?;:]+$/g, "").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function suggest(fragment: string, threads: ThreadLike[]): string | undefined {
  const t = ` ${fragment.toLowerCase().replace(/[^a-z0-9' -]/g, " ")} `;
  let best: { id: string; hits: number } | undefined;
  for (const th of threads) {
    const hits = th.keywords.filter((k) => t.includes(` ${k} `) || t.includes(` ${k}s `)).length;
    if (hits && (!best || hits > best.hits)) best = { id: th.id, hits };
  }
  return best?.id;
}

export function parseBrainDump(text: string, now: Date, threads: ThreadLike[] = []): Suggestion[] {
  return splitThoughts(text).map((source, i) => {
    const due = findDate(source, now);
    const vague = due ? undefined : source.match(VAGUE)?.[0];
    const kind = classify(source);
    return {
      id: `s${i}`,
      source,
      kind,
      title: cleanTitle(source, due?.phrase),
      ...(due && { due }),
      ...(vague && { timeHint: vague.toLowerCase() }),
      threadId: suggest(source, threads),
    };
  });
}
