import { describe, expect, it } from "vitest";
import { addDays, relativeDay, untilLabel } from "./index";

const now = new Date("2026-10-20T08:00:00");

describe("dates", () => {
  it("adds days from the start of today", () => {
    expect(addDays(now, 3).getDate()).toBe(23);
  });
  it("describes nearby days in words", () => {
    expect(relativeDay(0, now)).toBe("today");
    expect(relativeDay(1, now)).toBe("tomorrow");
    expect(relativeDay(2, now)).toBe("Thursday");
    expect(relativeDay(-3, now)).toBe("3 days ago");
    expect(relativeDay(30, now)).toBe("Nov 19");
  });
});

describe("untilLabel", () => {
  it("counts down", () => {
    expect(untilLabel(9)).toBe("in 9 days");
    expect(untilLabel(1)).toBe("tomorrow");
  });
});
