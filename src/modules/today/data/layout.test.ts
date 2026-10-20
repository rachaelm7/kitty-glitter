import { describe, expect, it } from "vitest";
import { DEFAULT_LAYOUT, moveWidget, resolveOrder, toggleWidget, visibleWidgets, type Layout } from "./layout";

describe("Today widget layout", () => {
  it("hides quick capture by default", () => {
    expect(visibleWidgets(DEFAULT_LAYOUT)).not.toContain("capture");
  });
  it("moves widgets and stops at the ends", () => {
    const l = moveWidget(DEFAULT_LAYOUT, "needs", -1);
    expect(resolveOrder(l).slice(0, 2)).toEqual(["needs", "brief"]);
    expect(moveWidget(l, "needs", -1)).toBe(l);
  });
  it("toggles visibility", () => {
    const l = toggleWidget(DEFAULT_LAYOUT, "agenda");
    expect(visibleWidgets(l)).not.toContain("agenda");
    expect(visibleWidgets(toggleWidget(l, "agenda"))).toContain("agenda");
  });
  it("survives saved layouts from older versions", () => {
    const old = { order: ["needs", "gone-widget", "brief"], hidden: [] } as unknown as Layout;
    const order = resolveOrder(old);
    expect(order.slice(0, 2)).toEqual(["needs", "brief"]);
    expect(order).not.toContain("gone-widget");
    expect(order).toContain("trip");
  });
});
