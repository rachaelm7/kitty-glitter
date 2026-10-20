import { describe, expect, it } from "vitest";
import { cleanTitle, findDate, parseBrainDump, splitThoughts } from "./parse";

// Tuesday, Oct 20 2026
const now = new Date("2026-10-20T09:00:00");
const threads = [
  { id: "t-car", keywords: ["car", "insurance"] },
  { id: "t-lisbon", keywords: ["lisbon", "passport", "packing"] },
];

describe("splitThoughts", () => {
  it("splits on sentences, new lines and 'also'", () => {
    expect(splitThoughts("Call the clinic. Buy stamps\nalso renew my passport")).toEqual([
      "Call the clinic.",
      "Buy stamps",
      "renew my passport",
    ]);
  });
  it("does not split ordinary 'and'", () => {
    expect(splitThoughts("pick up milk and eggs")).toEqual(["pick up milk and eggs"]);
  });
});

describe("findDate never invents dates", () => {
  it("returns nothing when no date is said", () => {
    expect(findDate("call the plumber about the sink", now)).toBeUndefined();
    expect(findDate("pack for the trip next week", now)).toBeUndefined();
  });
  it("reads explicit days", () => {
    expect(findDate("pay it today", now)).toEqual({ dayOffset: 0, phrase: "today" });
    expect(findDate("email Dana tomorrow", now)).toEqual({ dayOffset: 1, phrase: "tomorrow" });
    expect(findDate("send it by Friday", now)).toEqual({ dayOffset: 3, phrase: "by friday" });
    expect(findDate("dentist on Tuesday", now)).toEqual({ dayOffset: 7, phrase: "on tuesday" });
    expect(findDate("in 5 days renew it", now)).toEqual({ dayOffset: 5, phrase: "in 5 days" });
    expect(findDate("party on Nov 3rd", now)).toEqual({ dayOffset: 14, phrase: "on nov 3rd" });
  });
});

describe("cleanTitle", () => {
  it("drops filler and intent words and the date phrase", () => {
    expect(cleanTitle("Um so I need to call the vet by Friday.", "by friday")).toBe("Call the vet");
    expect(cleanTitle("remind me to water the plants")).toBe("Water the plants");
  });
});

describe("parseBrainDump", () => {
  it("classifies, suggests threads and keeps vague timing as a hint", () => {
    const out = parseBrainDump(
      "I need to renew the car insurance by Friday. Remind me to find my passport for Lisbon. I'm a bit worried about the packing list next week",
      now,
      threads,
    );
    expect(out).toHaveLength(3);
    expect(out[0]).toMatchObject({ kind: "task", title: "Renew the car insurance", threadId: "t-car", due: { dayOffset: 3 } });
    expect(out[1]).toMatchObject({ kind: "reminder", title: "Find my passport for Lisbon", threadId: "t-lisbon" });
    expect(out[1].due).toBeUndefined();
    expect(out[2]).toMatchObject({ kind: "note", timeHint: "next week", threadId: "t-lisbon" });
    expect(out[2].due).toBeUndefined();
  });
});
