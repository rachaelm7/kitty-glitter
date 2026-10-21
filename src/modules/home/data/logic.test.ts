import { describe, expect, it } from "vitest";
import { SEED_COVERAGE, SEED_MAINTENANCE } from "./mock";
import { coverageState, nextDue, sortMaintenance } from "./logic";

describe("home maintenance", () => {
  it("computes next due from the last time it was done", () => {
    expect(nextDue(SEED_MAINTENANCE[0])).toEqual({ offset: -14, state: "overdue" });
    expect(nextDue(SEED_MAINTENANCE[1])).toEqual({ offset: 4, state: "soon" });
    expect(nextDue(SEED_MAINTENANCE[4]).state).toBe("ok");
  });
  it("lists the most pressing first", () => {
    expect(sortMaintenance(SEED_MAINTENANCE)[0].id).toBe("h1");
  });
  it("flags coverage ending within 30 days", () => {
    expect(coverageState(SEED_COVERAGE[0])).toBe("soon");
    expect(coverageState(SEED_COVERAGE[1])).toBe("ok");
  });
});
