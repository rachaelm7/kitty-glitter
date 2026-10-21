import { describe, expect, it } from "vitest";
import { daysBetweenISO, revive, shiftChanged } from "./createStore";

const shift = (xs: { at: number }[], d: number) => xs.map((x) => ({ at: x.at + d }));

describe("saved day offsets move with the calendar", () => {
  it("counts whole days across months and daylight saving", () => {
    expect(daysBetweenISO("2026-10-20", "2026-10-21")).toBe(1);
    expect(daysBetweenISO("2026-10-31", "2026-11-02")).toBe(2); // US clocks change Nov 1
    expect(daysBetweenISO("2026-03-08", "2026-03-07")).toBe(-1);
  });
  it("moves offsets saved on an earlier day", () => {
    // Saved on the 20th as "in 2 days"; read on the 21st it is tomorrow.
    expect(revive({ savedOn: "2026-10-20", state: [{ at: 2 }] }, "2026-10-21", shift)).toEqual([{ at: 1 }]);
  });
  it("leaves same-day saves alone", () => {
    const state = [{ at: 2 }];
    expect(revive({ savedOn: "2026-10-21", state }, "2026-10-21", shift)).toBe(state);
  });
  it("reads saves from before dates were remembered as-is", () => {
    expect(revive([{ at: 2 }], "2026-10-21", shift)).toEqual([{ at: 2 }]);
  });
  it("ignores the wrapper for stores without offsets", () => {
    expect(revive({ savedOn: "2026-10-20", state: 1 }, "2026-10-21")).toEqual({ savedOn: "2026-10-20", state: 1 });
  });
});

describe("only changed sample items age", () => {
  const seed = [{ id: "a", at: 2 }, { id: "b", at: 5 }];
  const shiftList = shiftChanged(seed, (x, d) => ({ ...x, at: x.at + d }));
  it("keeps untouched sample items fresh and moves changed or new ones", () => {
    const saved = [{ id: "a", at: 2 }, { id: "b", at: 6 }, { id: "c", at: 3 }];
    expect(shiftList(saved, -1)).toEqual([{ id: "a", at: 2 }, { id: "b", at: 5 }, { id: "c", at: 2 }]);
  });
});
