import type { Appointment } from "@/modules/appointments";
import type { Message } from "@/modules/email";
import type { Task } from "@/modules/tasks";
import type { LifeThread } from "@/modules/threads";
import type { Trip } from "@/modules/travel";
import type { MaintenanceItem } from "@/modules/home";

export type SearchKind = "page" | "email" | "task" | "thread" | "appointment" | "trip" | "upkeep";
export type SearchTarget = { type: "href"; href: string } | { type: "email"; id: string } | { type: "task"; id: string };

export type SearchItem = {
  /** Stable across sessions, so "recent" can remember it. */
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  /** Extra words that should find it but aren't shown. */
  keywords?: string;
  /** Small nudge up or down. It breaks ties between similar matches; a clearly better text match still wins. */
  boost?: number;
  target: SearchTarget;
};

export const KIND_LABEL: Record<SearchKind, string> = {
  page: "Page",
  email: "Email",
  task: "Task",
  thread: "Life Thread",
  appointment: "Appointment",
  trip: "Trip",
  upkeep: "Home upkeep",
};

export const PAGES: SearchItem[] = [
  { id: "page:today", kind: "page", title: "Today", subtitle: "Your morning brief and priorities", keywords: "home dashboard brief", target: { type: "href", href: "/" } },
  { id: "page:inbox", kind: "page", title: "Inbox", subtitle: "All five accounts", keywords: "email mail messages", target: { type: "href", href: "/inbox" } },
  { id: "page:tasks", kind: "page", title: "Tasks", subtitle: "Today, upcoming, waiting on", keywords: "todo to-do checklist", target: { type: "href", href: "/tasks" } },
  { id: "page:threads", kind: "page", title: "Life Threads", subtitle: "Every unfinished situation", keywords: "situations projects", target: { type: "href", href: "/threads" } },
  { id: "page:capture", kind: "page", title: "Brain dump", subtitle: "Type or talk, review before adding", keywords: "quick capture notes thoughts", target: { type: "href", href: "/capture" } },
  { id: "page:appointments", kind: "page", title: "Appointments", subtitle: "Referrals and follow-ups", keywords: "doctor dentist booking", target: { type: "href", href: "/appointments" } },
  { id: "page:rescue", kind: "page", title: "Email Rescue", subtitle: "Sort a huge unread pile", keywords: "cleanup unread declutter", target: { type: "href", href: "/inbox/rescue" } },
  { id: "page:travel", kind: "page", title: "Travel", subtitle: "Trips and packing", keywords: "trip flight packing holiday", target: { type: "href", href: "/travel" } },
  { id: "page:home", kind: "page", title: "Home", subtitle: "Upkeep, insurance, warranties", keywords: "house maintenance", target: { type: "href", href: "/home" } },
  { id: "page:finances", kind: "page", title: "Finances", subtitle: "Bills and subscriptions", keywords: "money budget", target: { type: "href", href: "/finances" } },
  { id: "page:collections", kind: "page", title: "Personal Collections", subtitle: "Gifts, books, recipes", keywords: "lists wishlist", target: { type: "href", href: "/collections" } },
  { id: "page:settings", kind: "page", title: "Settings", subtitle: "Theme, accounts, demo data", keywords: "appearance dark light theme reset", target: { type: "href", href: "/settings" } },
  { id: "page:more", kind: "page", title: "More", subtitle: "Everything else", target: { type: "href", href: "/more" } },
];

export type SearchSources = {
  messages: Message[];
  archived: Record<string, boolean>;
  read: Record<string, boolean>;
  tasks: Task[];
  threads: LifeThread[];
  appointments: Appointment[];
  trips: Trip[];
  upkeep: MaintenanceItem[];
};

/** Letters that don't decompose under NFD, folded by hand ("Søren" → "soren", "Straße" → "strasse"). */
const FOLD: Record<string, string> = { "ø": "o", "ł": "l", "đ": "d", "ß": "ss", "æ": "ae", "œ": "oe" };

/** Lowercase, strip accents and punctuation, keep letters and numbers in any script: "Maré Alta!" → "mare alta". */
export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[øłđßæœ]/g, (c) => FOLD[c])
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}$ ]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Typed words, de-duplicated and capped so a pasted wall of text can't make ranking slow. */
export const MAX_QUERY_WORDS = 8;
export function queryTokens(query: string) {
  return [...new Set(normalize(query).split(" ").filter(Boolean))].slice(0, MAX_QUERY_WORDS);
}

export function buildIndex(src: SearchSources): SearchItem[] {
  const items: SearchItem[] = [...PAGES];

  for (const m of src.messages) {
    const archived = !!src.archived[m.id];
    const unread = src.read[m.id] === undefined ? m.unread : !src.read[m.id];
    items.push({
      id: `email:${m.id}`,
      kind: "email",
      title: m.subject,
      subtitle: `${m.from}${archived ? " · archived" : ""}`,
      keywords: `${m.fromAddress} ${m.preview} ${m.summary}`,
      boost: (m.urgent ? 10 : 0) + (unread ? 3 : 0) - (archived ? 8 : 0),
      target: { type: "email", id: m.id },
    });
  }
  for (const t of src.tasks) {
    items.push({
      id: `task:${t.id}`,
      kind: "task",
      title: t.title,
      subtitle: t.status === "done" ? "Done" : t.status === "waiting" ? `Waiting on ${t.waitingOn ?? "someone"}` : t.category,
      keywords: `${t.notes ?? ""} ${t.emailFrom ?? ""} ${t.category}`,
      boost: t.status === "done" ? -12 : t.status === "waiting" ? 0 : 5,
      target: { type: "task", id: t.id },
    });
  }
  for (const th of src.threads) {
    items.push({
      id: `thread:${th.id}`,
      kind: "thread",
      title: th.name,
      subtitle: th.stage === "done" ? "Wrapped up" : th.status,
      keywords: `${th.blurb} ${th.keywords.join(" ")}`,
      boost: th.stage === "done" ? -10 : 6,
      target: { type: "href", href: `/threads/${th.id}` },
    });
  }
  for (const a of src.appointments) {
    items.push({
      id: `appointment:${a.id}`,
      kind: "appointment",
      title: a.title,
      subtitle: a.provider,
      keywords: `${a.referredBy ?? ""} ${a.status.replace("-", " ")}`,
      boost: a.status === "completed" ? -8 : 3,
      target: { type: "href", href: "/appointments" },
    });
  }
  for (const tr of src.trips) {
    items.push({
      id: `trip:${tr.id}`,
      kind: "trip",
      title: tr.name,
      subtitle: tr.destination,
      keywords: tr.reservations.map((r) => `${r.title} ${r.confirmation}`).join(" "),
      target: { type: "href", href: "/travel" },
    });
  }
  for (const u of src.upkeep) {
    items.push({ id: `upkeep:${u.id}`, kind: "upkeep", title: u.title, subtitle: u.area, keywords: u.how ?? "", target: { type: "href", href: "/home" } });
  }
  return items;
}

type Prepared = { item: SearchItem; title: string; titleWords: string[]; subtitle: string; keywords: string };
const cache = new WeakMap<SearchItem[], Prepared[]>();

/** Normalized text per item, computed once per index (not on every keystroke). */
function prepare(index: SearchItem[]): Prepared[] {
  let p = cache.get(index);
  if (!p) {
    p = index.map((item) => {
      const title = normalize(item.title);
      return { item, title, titleWords: title.split(" "), subtitle: normalize(item.subtitle ?? ""), keywords: normalize(item.keywords ?? "") };
    });
    cache.set(index, p);
  }
  return p;
}

function scoreToken(p: Prepared, token: string): number {
  if (p.title.startsWith(token)) return 120;
  if (p.titleWords.some((w) => w.startsWith(token))) return 100;
  if (p.title.includes(token)) return 60;
  if (p.subtitle.includes(token)) return 35;
  if (p.keywords.includes(token)) return 20;
  return 0;
}

/** Every typed word must match somewhere; results are ordered by match quality, then boost. */
export function rank(index: SearchItem[], query: string, limit = 30): SearchItem[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const p of prepare(index)) {
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      const s = scoreToken(p, t);
      if (s === 0) {
        ok = false;
        break;
      }
      score += s;
    }
    if (ok) scored.push({ item: p.item, score: score + (p.item.boost ?? 0) });
  }
  return scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title)).slice(0, limit).map((x) => x.item);
}

/** With nothing typed: what you opened last, then the main pages. */
export function defaultResults(index: SearchItem[], recentIds: string[], limit = 8): SearchItem[] {
  const byId = new Map(index.map((i) => [i.id, i]));
  const recents = recentIds.map((id) => byId.get(id)).filter((i): i is SearchItem => !!i);
  const seen = new Set(recents.map((r) => r.id));
  const pages = ["page:today", "page:inbox", "page:tasks", "page:threads", "page:capture"].map((id) => byId.get(id)).filter((i): i is SearchItem => !!i && !seen.has(i.id));
  return [...recents, ...pages].slice(0, limit);
}
