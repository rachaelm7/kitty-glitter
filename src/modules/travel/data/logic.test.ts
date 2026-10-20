import { describe, expect, it } from "vitest";
import { SEED_TRIPS } from "./mock";
import { groupPacking, itinerary, packingProgress, tripReminders } from "./logic";

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
