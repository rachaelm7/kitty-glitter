import { describe, expect, it } from "vitest";
import { composeBrief } from "./brief";

const item = (title: string, briefLine?: string) => ({ id: title, title, who: "x", when: "y", briefLine });

describe("composeBrief", () => {
  it("reads like the approved example", () => {
    expect(
      composeBrief(
        [
          item("a", "your dental appointment needs confirmation"),
          item("b", "a sample insurance renewal is approaching"),
          item("c", "a friend is waiting for your response about Saturday"),
        ],
        2,
      ),
    ).toBe(
      "You have three things worth your attention today. Your dental appointment needs confirmation, a sample insurance renewal is approaching, and a friend is waiting for your response about Saturday. Everything else can wait.",
    );
  });
  it("falls back to the title and is calm when nothing is open", () => {
    expect(composeBrief([item("Review the plan")], 0)).toBe("You have one thing worth your attention today. Review the plan. Everything else can wait.");
    expect(composeBrief([], 0)).toMatch(/Nothing urgent/);
  });
});
