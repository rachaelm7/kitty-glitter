import { describe, expect, it } from "vitest";
import { composeBrief } from "./brief";

const item = (title: string) => ({ id: title, title, who: "x", when: "y" });

describe("composeBrief", () => {
  it("lists open items in plain words", () => {
    expect(composeBrief([item("Confirm the appointment"), item("Review the plan")], 3)).toBe(
      "Two things need you: confirm the appointment and review the plan. Everything else can wait.",
    );
  });
  it("is calm when nothing is open", () => {
    expect(composeBrief([], 0)).toMatch(/Nothing urgent/);
  });
});
