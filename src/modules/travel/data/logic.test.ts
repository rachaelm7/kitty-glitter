import { describe, expect, it } from "vitest";
import { SEED_TRIPS } from "./mock";
import { groupPacking, itinerary, packingProgress, tripReminders, validateTrip } from "./logic";

const lisbon = SEED_TRIPS[0];

describe("travel", () => {
  it("measures packing progress", () => {
    expect(packingProgress(lisbon.packing)).toEqual({ packed: 2, total: 9, pct: 22 });
  });
  it("groups packing in a stable order", () => {
    expect(groupPacking(lisbon.packing).map((g) => g.group)).toEqual(["Documents", "Clothes", "Toiletries", "Tech", "Other"]);
  });
  it("builds an itinerary only from booked days", () => {
    const days = itinerary(lisbon);
    expect(days[0].items[0].kind).toBe("flight");
    expect(days.every((d) => d.items.length > 0)).toBe(true);
  });
  it("reminds about unpacked documents without inventing deadlines", () => {
    const r = tripReminders(lisbon);
    expect(r[0]).toMatch(/passport/);
    expect(r.join(" ")).not.toMatch(/\bby\b|\bdue\b/i);
  });
});

describe("trip form rules", () => {
  const ok = { name: "Kyoto", destination: "Kyoto, Japan", start: "2026-11-10", nights: "4" };
  it("accepts a complete trip, including a day trip", () => {
    expect(validateTrip(ok)).toEqual({});
    expect(validateTrip({ ...ok, nights: "0" })).toEqual({});
  });
  it("rejects missing fields and odd night counts", () => {
    expect(Object.keys(validateTrip({ name: "", destination: "", start: "", nights: "" })).sort()).toEqual(["destination", "name", "nights", "start"]);
    for (const nights of ["-1", "2.5", "61", "abc"]) expect(validateTrip({ ...ok, nights }).nights).toBeDefined();
  });
});
