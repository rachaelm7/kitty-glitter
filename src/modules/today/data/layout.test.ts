import { describe, expect, it } from "vitest";
import { DEFAULT_LAYOUT, moveWidget, resolveOrder, toggleWidget, visibleWidgets, type Layout } from "./layout";

describe("Today widget layout", () => {
  it("hides the extra mail widgets by default", () => {
    expect(visibleWidgets(DEFAULT_LAYOUT)).not.toContain("promos");
  });
  it("moves widgets and stops at the ends", () => {
    const l = moveWidget(DEFAULT_LAYOUT, "priorities", -1); // was third (after brief and changes)
    expect(resolveOrder(l).slice(0, 3)).toEqual(["brief", "priorities", "changes"]);
    expect(moveWidget(l, "brief", -1)).toBe(l); // already first
  });
  it("toggles visibility", () => {
    const l = toggleWidget(DEFAULT_LAYOUT, "agenda");
    expect(visibleWidgets(l)).not.toContain("agenda");
    expect(visibleWidgets(toggleWidget(l, "agenda"))).toContain("agenda");
  });
  it("survives saved layouts from older versions", () => {
    const old = { order: ["priorities", "gone-widget", "brief"], hidden: [] } as unknown as Layout;
    const order = resolveOrder(old);
    expect(order.slice(0, 2)).toEqual(["priorities", "brief"]);
    expect(order).not.toContain("gone-widget");
    expect(order).toContain("trip");
  });
});
