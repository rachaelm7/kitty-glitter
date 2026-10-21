/**
 * Rule-based Brain Dump parser. No AI, no network: it splits a ramble into
 * suggestions and only attaches a date when the words say one explicitly.
 * Vague timing ("next week", "soon") becomes a hint, never a due date.
 * It also notices repeats ("every Sunday") and things you're waiting on
 * someone else for ("waiting on the plumber to send a quote").
 */

export type SuggestionKind = "task" | "reminder" | "note";

export type Suggestion = {
  id: string;
  source: string; // the words this came from
  title: string;
  kind: SuggestionKind;
  due?: { dayOffset: number; phrase: string };
  timeHint?: string;
  /** Said to repeat, e.g. "every week" → 7 days. */
  repeat?: { days: number; phrase: string };
  /** The next step is someone else's, e.g. "waiting on Dana". */
  waiting?: { who: string; phrase: string };
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

const WORD_NUM = "\\d+|one|two|three|four|five|six|seven|ten|other|second";
const UNIT_DAYS: Record<string, number> = { day: 1, week: 7, month: 30, year: 365 };
const DAY_NAMES = "sunday|monday|tuesday|wednesday|thursday|friday|saturday";

/** Fixed phrases first, longest meaning first, so "every other week" isn't read as "every week". */
const REPEATS: [RegExp, number][] = [
  [/\b(?:every (?:other|second) week|bi-?weekly|fortnightly)\b/, 14],
  [/\b(?:twice a year|every half year)\b/, 180],
  [/\bquarterly\b/, 90],
  [new RegExp(`\\b(?:every (?:${DAY_NAMES})|on (?:${DAY_NAMES})s)\\b`), 7],
  [/\b(?:every day|each day|daily)\b/, 1],
  [/\b(?:every week|each week|once a week|weekly)\b/, 7],
  [/\b(?:every month|each month|once a month|monthly)\b/, 30],
  [/\b(?:every year|each year|once a year|yearly|annually)\b/, 365],
];

/** "every 3 months", "every other day": a number with a unit. */
const REPEAT_N = new RegExp(`\\bevery (${WORD_NUM}) (day|week|month|year)s?\\b`);

export function findRepeat(fragment: string): { days: number; phrase: string } | undefined {
  const f = fragment.toLowerCase();
  const m = f.match(REPEAT_N);
  if (m) {
    const n = m[1] === "other" || m[1] === "second" ? 2 : /^\d+$/.test(m[1]) ? Number(m[1]) : NUMBERS[m[1]];
    if (n && n > 0 && n <= 24) return { days: n * UNIT_DAYS[m[2]], phrase: m[0] };
  }
  for (const [re, days] of REPEATS) {
    const hit = f.match(re);
    if (hit) return { days, phrase: hit[0] };
  }
  return undefined;
}

const PRONOUN = /^(?:he|she|they|it|them|someone|somebody|nobody|no one)$/i;
const WAIT_FOR = /\b(?:(?:i'?m|i am|we'?re|we are|still)\s+)*waiting (?:on|for) (.+?)(?:\s+to\s+(.+))?$/i;
const WAIT_HEAR = /\b(?:(?:i'?m|i am|still)\s+)*waiting to hear (?:back )?from (.+?)(?:\s+(about|on|re)\s+(.+))?$/i;
const WAIT_SILENT =
  /^(.+?)\s+(?:still\s+)?(?:hasn'?t|has not|haven'?t|have not|never)\s+(?:replied|responded|answered|confirmed|called back|written back|gotten back|got back|sent (?:it|them|that|the \w+)|emailed back)(?:\s+to me)?(?:\s+(about|on|re)\s+(.+))?$/i;

const tidy = (s: string) => s.replace(/[\s,.!?;:]+$/g, "").trim();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Notices when the next step is someone else's. Returns who you're waiting on and a title
 * that reads well in a "Waiting on" list. Only explicit wording counts; nothing is guessed.
 */
export function findWaiting(fragment: string): { who: string; title: string; phrase: string } | undefined {
  const f = tidy(fragment.replace(LEAD_FILLERS, ""));
  let m = f.match(WAIT_HEAR);
  if (m) {
    const who = tidy(m[1]);
    return { who, title: `Hear back from ${who}${m[3] ? ` ${m[2]} ${tidy(m[3])}` : ""}`, phrase: m[0] };
  }
  m = f.match(WAIT_FOR);
  if (m) {
    const who = tidy(m[1]);
    // "waiting on Dana" reads better as "Hear back from Dana"; "waiting for the refund" stays "The refund".
    const title = m[2] ? `${cap(who)} to ${tidy(m[2])}` : /^[A-Z][a-z]+(?: [A-Z][a-z]+)?$/.test(who) ? `Hear back from ${who}` : cap(who);
    return { who, title, phrase: m[0] };
  }
  m = f.match(WAIT_SILENT);
  if (m) {
    const raw = tidy(m[1].replace(/^(?:and|but|so)\s+/i, ""));
    const who = PRONOUN.test(raw) ? "someone" : raw;
    return { who, title: `Hear back from ${PRONOUN.test(raw) ? "them" : who}${m[3] ? ` ${m[2]} ${tidy(m[3])}` : ""}`, phrase: m[0] };
  }
  return undefined;
}

/** Removes a phrase (case-insensitively) and the spaces it leaves behind. */
function without(text: string, phrase?: string) {
  if (!phrase) return text;
  const idx = text.toLowerCase().lastIndexOf(phrase.toLowerCase());
  if (idx < 0) return text;
  return (text.slice(0, idx) + text.slice(idx + phrase.length)).replace(/\s{2,}/g, " ").trim();
}

function classify(fragment: string): SuggestionKind {
  if (REMINDER.test(fragment)) return "reminder";
  const body = fragment.replace(LEAD_FILLERS, "");
  if (TASK_ANY.test(body) || TASK_START.test(body)) return "task";
  return "note";
}

export function cleanTitle(fragment: string, datePhrase?: string, repeatPhrase?: string): string {
  let t = without(fragment.trim(), repeatPhrase).replace(LEAD_FILLERS, "");
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
    const repeat = findRepeat(source);
    const waiting = findWaiting(source);
    const kind = waiting && !REMINDER.test(source) ? "task" : classify(source);
    const title = waiting ? cleanTitle(waiting.title, due?.phrase, repeat?.phrase) : cleanTitle(source, due?.phrase, repeat?.phrase);
    return {
      id: `s${i}`,
      source,
      kind,
      title,
      ...(due && { due }),
      ...(vague && { timeHint: vague.toLowerCase() }),
      ...(repeat && { repeat }),
      ...(waiting && { waiting: { who: tidy(without(waiting.who, due?.phrase)), phrase: waiting.phrase } }),
      threadId: suggest(source, threads),
    };
  });
}
