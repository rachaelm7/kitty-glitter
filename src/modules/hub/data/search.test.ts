import { describe, expect, it } from "vitest";
import { SEED_APPOINTMENTS } from "@/modules/appointments/data/mock";
import { MESSAGES } from "@/modules/email/data/mock";
import { SEED_MAINTENANCE } from "@/modules/home/data/mock";
import { SEED_TASKS } from "@/modules/tasks/data/mock";
import { SEED_THREADS } from "@/modules/threads/data/mock";
import { SEED_TRIPS } from "@/modules/travel/data/mock";
import { MAX_QUERY_WORDS, browse, buildIndex, defaultResults, normalize, parseQuery, queryTokens, rank, type SearchSources } from "./search";

const src: SearchSources = { messages: MESSAGES, archived: {}, read: {}, tasks: SEED_TASKS, threads: SEED_THREADS, appointments: SEED_APPOINTMENTS, trips: SEED_TRIPS, upkeep: SEED_MAINTENANCE };
const index = buildIndex(src);
const ids = (q: string, limit?: number) => rank(index, q, limit).map((r) => r.id);

describe("normalize", () => {
  it("ignores case, accents and punctuation", () => {
    expect(normalize("  Maré   Alta! ")).toBe("mare alta");
  });
  it("folds letters that don't decompose, and keeps other scripts", () => {
    expect(normalize("Søren Łukasz Straße")).toBe("soren lukasz strasse");
    expect(normalize("日本 Привет")).toBe("日本 привет");
  });
  it("de-duplicates and caps the words in a query", () => {
    expect(queryTokens("faucet faucet FAUCET")).toEqual(["faucet"]);
    expect(queryTokens("a b c d e f g h i j k")).toHaveLength(MAX_QUERY_WORDS);
  });
  it("finds text written in another script", () => {
    const idx = buildIndex({ ...src, tasks: [{ id: "x", title: "Buy 日本茶 for Priya", status: "open", category: "Errands", createdAt: 1 }] });
    expect(rank(idx, "日本茶")[0].id).toBe("task:x");
  });
});

describe("indexing", () => {
  it("covers every source and has unique ids", () => {
    const kinds = new Set(index.map((i) => i.kind));
    for (const k of ["page", "action", "email", "task", "thread", "appointment", "trip", "upkeep"]) expect(kinds.has(k as never)).toBe(true);
    expect(new Set(index.map((i) => i.id)).size).toBe(index.length);
  });
});

describe("ranking", () => {
  it("finds the same situation across modules from one word", () => {
    const found = new Set(rank(index, "dental").map((r) => r.kind));
    expect(found).toEqual(new Set(["thread", "email", "task", "appointment"]));
  });
  it("requires every word to match", () => {
    expect(ids("faucet estimate")).toContain("email:m8");
    expect(ids("faucet zebra")).toEqual([]);
  });
  it("puts a title match above a keyword-only match", () => {
    expect(ids("lisbon")[0]).toMatch(/^(thread|trip):/);
    const kw = rank(index, "tram"); // only in a trip reservation title
    expect(kw[0].id).toBe("trip:lisbon");
  });
  it("matches senders, addresses and confirmation codes", () => {
    expect(ids("pipewise")).toContain("email:m8");
    expect(ids("office.pipewise@example.com")).toContain("email:m8");
    expect(ids("kg7q2x")).toContain("trip:lisbon");
  });
  it("is accent-insensitive", () => {
    expect(ids("mare alta")).toContain("trip:lisbon");
  });
  it("lets pages win when you type their name", () => {
    expect(ids("settings")[0]).toBe("page:settings");
    expect(ids("brain")[0]).toBe("page:capture");
  });
  it("ranks open tasks above finished ones, and active threads above wrapped-up ones", () => {
    const r = ids("furnace filter");
    expect(r.indexOf("task:k12")).toBeLessThan(r.indexOf("task:k11")); // open before done
    const wrapped = buildIndex({ ...src, threads: SEED_THREADS.map((t) => (t.id === "t-dental" ? { ...t, stage: "done" as const } : t)) });
    const boost = (i: typeof index) => i.find((x) => x.id === "thread:t-dental")!.boost!;
    expect(boost(wrapped)).toBeLessThan(boost(index));
    // ...but a strong title match still beats a weak one, wrapped up or not.
    expect(rank(wrapped, "dental").slice(0, 3).map((x) => x.id)).toContain("thread:t-dental");
  });
  it("dims archived mail", () => {
    const archived = buildIndex({ ...src, archived: { m8: true } });
    expect(rank(archived, "faucet").find((r) => r.id === "email:m8")?.subtitle).toContain("archived");
  });
  it("respects the limit and returns nothing for an empty query", () => {
    expect(rank(index, "a", 5).length).toBeLessThanOrEqual(5);
    expect(rank(index, "   ")).toEqual([]);
  });
});

describe("with nothing typed", () => {
  it("shows recents first, then the main pages, without duplicates", () => {
    const r = defaultResults(index, ["task:k12", "page:inbox", "gone:1"]).map((i) => i.id);
    expect(r.slice(0, 2)).toEqual(["task:k12", "page:inbox"]);
    expect(r.filter((x) => x === "page:inbox")).toHaveLength(1);
    expect(r).toContain("page:today");
    expect(r).not.toContain("gone:1");
  });
});

describe("filters and actions", () => {
  it("reads '>' and '#kind' shorthands, and leaves other text alone", () => {
    expect(parseQuery("> new")).toEqual({ text: "new", kind: "action" });
    expect(parseQuery(">")).toEqual({ text: "", kind: "action" });
    expect(parseQuery("#task dentist")).toEqual({ text: "dentist", kind: "task" });
    expect(parseQuery("#Emails")).toEqual({ text: "", kind: "email" });
    expect(parseQuery("#nonsense lisbon")).toEqual({ text: "#nonsense lisbon" });
    expect(parseQuery("  dental  ")).toEqual({ text: "dental" });
  });
  it("limits results to one kind", () => {
    const tasks = rank(index, "dental", 30, "task");
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((r) => r.kind === "task")).toBe(true);
    expect(rank(index, "dental").some((r) => r.kind !== "task")).toBe(true);
  });
  it("finds actions by what they do", () => {
    expect(rank(index, "new trip", 3)[0].id).toBe("action:new-trip");
    expect(rank(index, "dark", 30, "action")[0].id).toBe("action:theme-dark");
  });
  it("lists a kind with nothing typed, most relevant first", () => {
    const appts = browse(index, "appointment");
    expect(appts).toHaveLength(SEED_APPOINTMENTS.length);
    expect(appts.at(-1)?.id).toBe("appointment:ap6"); // completed sinks to the bottom
    expect(browse(index, "action")[0].id).toBe("action:new-task");
  });
  it("opens appointments and trips directly, not just their page", () => {
    expect(index.find((i) => i.id === "appointment:ap2")?.target).toEqual({ type: "appointment", id: "ap2" });
    expect(index.find((i) => i.id === "trip:lisbon")?.target).toEqual({ type: "trip", id: "lisbon" });
  });
});
