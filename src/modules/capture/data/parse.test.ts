import { describe, expect, it } from "vitest";
import { cleanTitle, findDate, findRepeat, findWaiting, parseBrainDump, splitThoughts } from "./parse";

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
  it("splits a comma list of actions", () => {
    expect(splitThoughts("I need to schedule my dentist appointment, order cat food, and check on the insurance renewal.")).toEqual([
      "I need to schedule my dentist appointment",
      "order cat food",
      "check on the insurance renewal.",
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

describe("the approved example", () => {
  it("turns one messy thought into three tasks with no dates", () => {
    const out = parseBrainDump(
      "I need to schedule my dentist appointment, order cat food, and check on the insurance renewal.",
      now,
      [{ id: "t-dental", keywords: ["dentist"] }, ...threads],
    );
    expect(out.map((s) => [s.kind, s.title, s.threadId])).toEqual([
      ["task", "Schedule my dentist appointment", "t-dental"],
      ["task", "Order cat food", undefined],
      ["task", "Check on the insurance renewal", "t-car"],
    ]);
    expect(out.every((s) => s.due === undefined)).toBe(true);
  });
});

describe("repeats", () => {
  it("reads common repeat wording", () => {
    const cases: [string, number][] = [
      ["water the plants every Sunday", 7],
      ["take out recycling weekly", 7],
      ["call grandma every other week", 14],
      ["pay rent monthly", 30],
      ["replace the furnace filter every 3 months", 90],
      ["renew the parking permit every year", 365],
      ["clean the gutters twice a year", 180],
      ["feed the cat every day", 1],
      ["water the herbs on Sundays", 7],
    ];
    for (const [text, days] of cases) expect(findRepeat(text)?.days, text).toBe(days);
  });
  it("ignores text without a repeat", () => {
    expect(findRepeat("call the plumber about the sink")).toBeUndefined();
    expect(findRepeat("every so often I forget my keys")).toBeUndefined();
  });
  it("sets the first date from a weekday and drops the repeat words from the title", () => {
    const [s] = parseBrainDump("Remind me every Sunday to water the plants", now);
    expect(s).toMatchObject({ kind: "reminder", title: "Water the plants", repeat: { days: 7 }, due: { dayOffset: 5 } });
  });
  it("keeps repeats without a day undated", () => {
    const [s] = parseBrainDump("I need to pay the water bill every month", now);
    expect(s).toMatchObject({ kind: "task", title: "Pay the water bill", repeat: { days: 30 } });
    expect(s.due).toBeUndefined();
  });
});

describe("waiting on others", () => {
  it("reads 'waiting on/for … to …'", () => {
    expect(findWaiting("I'm still waiting on the plumber to send a quote")).toMatchObject({ who: "the plumber", title: "The plumber to send a quote" });
    expect(findWaiting("waiting for the refund")).toMatchObject({ who: "the refund", title: "The refund" });
    expect(findWaiting("waiting on Dana")).toMatchObject({ who: "Dana", title: "Hear back from Dana" });
  });
  it("reads 'hasn't replied' and 'waiting to hear back'", () => {
    expect(findWaiting("Dana still hasn't replied about the venue")).toMatchObject({ who: "Dana", title: "Hear back from Dana about the venue" });
    expect(findWaiting("waiting to hear back from Stride Physio about the intake")).toMatchObject({ who: "Stride Physio", title: "Hear back from Stride Physio about the intake" });
    expect(findWaiting("they haven't called back")).toMatchObject({ who: "someone", title: "Hear back from them" });
  });
  it("leaves ordinary tasks alone", () => {
    expect(findWaiting("call the plumber about the sink")).toBeUndefined();
    expect(findWaiting("reply to Dana about the venue")).toBeUndefined();
  });
  it("turns waiting thoughts into waiting tasks in a brain dump, keeping a stated follow-up date", () => {
    const out = parseBrainDump("Order cat food. Still waiting on the insurance company to send the new card by Friday", now, threads);
    expect(out[0]).toMatchObject({ kind: "task", title: "Order cat food" });
    expect(out[0].waiting).toBeUndefined();
    expect(out[1]).toMatchObject({
      kind: "task",
      title: "The insurance company to send the new card",
      waiting: { who: "the insurance company" },
      due: { dayOffset: 3 },
      threadId: "t-car",
    });
  });
});
