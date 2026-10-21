import { describe, expect, it } from "vitest";
import { MAX_DRAG, clampDrag, decideSwipe, isHorizontalIntent } from "./swipe";

describe("swipe rules", () => {
  it("only treats clearly horizontal movement as a swipe", () => {
    expect(isHorizontalIntent(30, 4)).toBe(true);
    expect(isHorizontalIntent(30, 25)).toBe(false); // diagonal: let the page scroll
    expect(isHorizontalIntent(6, 0)).toBe(false); // too small to tell
  });
  it("commits on distance or on a quick flick, in the right direction", () => {
    expect(decideSwipe(-80, 600)).toBe("left");
    expect(decideSwipe(90, 600)).toBe("right");
    expect(decideSwipe(-50, 600)).toBeNull(); // short and slow
    expect(decideSwipe(-50, 60)).toBe("left"); // short but fast
    expect(decideSwipe(20, 10)).toBeNull(); // tiny, even if fast
  });
  it("limits how far a row can be dragged", () => {
    expect(clampDrag(400)).toBe(MAX_DRAG);
    expect(clampDrag(-400)).toBe(-MAX_DRAG);
    expect(clampDrag(25)).toBe(25);
  });
});
