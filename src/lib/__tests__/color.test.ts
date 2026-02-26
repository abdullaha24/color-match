import { describe, it, expect } from "vitest";
import { rgbToLab, deltaE } from "../color";

describe("Color Math Algorithm", () => {
  it("converts RGB(255, 0, 0) to expected L*a*b*", () => {
    const lab = rgbToLab({ r: 255, g: 0, b: 0 });
    expect(lab.L).toBeCloseTo(53.24, 1);
    expect(lab.a).toBeCloseTo(80.09, 1);
    expect(lab.b).toBeCloseTo(67.20, 1);
  });

  it("converts RGB(0, 255, 0) to expected L*a*b*", () => {
    const lab = rgbToLab({ r: 0, g: 255, b: 0 });
    expect(lab.L).toBeCloseTo(87.73, 1);
    expect(lab.a).toBeCloseTo(-86.18, 1);
    expect(lab.b).toBeCloseTo(83.18, 1);
  });

  it("converts RGB(0, 0, 255) to expected L*a*b*", () => {
    const lab = rgbToLab({ r: 0, g: 0, b: 255 });
    expect(lab.L).toBeCloseTo(32.30, 1);
    expect(lab.a).toBeCloseTo(79.20, 1);
    expect(lab.b).toBeCloseTo(-107.86, 1);
  });

  it("converts RGB(255, 255, 255) to expected L*a*b*", () => {
    const lab = rgbToLab({ r: 255, g: 255, b: 255 });
    expect(lab.L).toBeCloseTo(100, 1);
    expect(lab.a).toBeCloseTo(0, 1);
    expect(lab.b).toBeCloseTo(0, 1);
  });

  it("converts RGB(0, 0, 0) to expected L*a*b*", () => {
    const lab = rgbToLab({ r: 0, g: 0, b: 0 });
    expect(lab.L).toBeCloseTo(0, 1);
    expect(lab.a).toBeCloseTo(0, 1);
    expect(lab.b).toBeCloseTo(0, 1);
  });

  it("converts mid-gray RGB(128, 128, 128) to expected L*a*b*", () => {
    const lab = rgbToLab({ r: 128, g: 128, b: 128 });
    expect(lab.L).toBeCloseTo(53.59, 1);
    expect(lab.a).toBeCloseTo(0, 1);
    expect(lab.b).toBeCloseTo(0, 1);
  });

// ── CIEDE2000 Delta E Tests ─────────────────────────────────

  it("returns dE = 0 for identical colors", () => {
    const lab = { L: 50, a: 50, b: 50 };
    const result = deltaE(lab, lab);
    expect(result.dE).toBe(0);
    expect(result.dL).toBe(0);
    expect(result.da).toBe(0);
    expect(result.db).toBe(0);
  });

  it("returns dE = 0 for black vs black (edge case: zero chroma)", () => {
    const black = { L: 0, a: 0, b: 0 };
    const result = deltaE(black, black);
    expect(result.dE).toBe(0);
  });

  it("computes CIEDE2000 for known reference pair 1", () => {
    // Sharma et al. (2005) test pair #1
    // L1=50.0000, a1=2.6772, b1=-79.7751
    // L2=50.0000, a2=0.0000, b2=-82.7485
    const lab1 = { L: 50.0, a: 2.6772, b: -79.7751 };
    const lab2 = { L: 50.0, a: 0.0, b: -82.7485 };
    const { dE } = deltaE(lab1, lab2);
    expect(dE).toBeCloseTo(2.0425, 4);
  });

  it("computes CIEDE2000 for known reference pair 2", () => {
    // Sharma et al. (2005) test pair #23 (Note: original plan accidentally cited pair 25's expected output)
    // L1=50.0000, a1=2.5000, b1=0.0000
    // L2=56.0000, a2=-27.0000, b2=-3.0000
    const lab1 = { L: 50.0, a: 2.5, b: 0.0 };
    const lab2 = { L: 56.0, a: -27.0, b: -3.0 };
    const { dE } = deltaE(lab1, lab2);
    expect(dE).toBeCloseTo(31.9030, 4);
  });

  it("still returns correct raw L*a*b* deltas alongside dE", () => {
    const target = { L: 60, a: 10, b: 20 };
    const current = { L: 55, a: 15, b: 25 };
    const result = deltaE(target, current);
    // dL = target.L - current.L = 60 - 55 = 5
    expect(result.dL).toBe(5);
    // da = target.a - current.a = 10 - 15 = -5
    expect(result.da).toBe(-5);
    // db = target.b - current.b = 20 - 25 = -5
    expect(result.db).toBe(-5);
    // dE should be a positive number, different from CIE76's sqrt(75) ≈ 8.66
    expect(result.dE).toBeGreaterThan(0);
    expect(result.dE).not.toBeCloseTo(8.66, 1);
  });
});
