import { describe, it, expect } from "vitest";
import { levelForXp } from "../xp";

describe("levelForXp", () => {
  it("returns level 1 at 0 XP [REQ-XP-01]", () => {
    expect(levelForXp(0)).toBe(1);
  });
  it("returns level 2 at 100 XP [REQ-XP-01]", () => {
    expect(levelForXp(100)).toBe(2);
  });
  it("returns level 5 at 450 XP [REQ-XP-01]", () => {
    expect(levelForXp(450)).toBe(5);
  });
});