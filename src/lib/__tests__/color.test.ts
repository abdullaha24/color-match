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

  it("calculates Delta E correctly for identical colors", () => {
    const lab1 = { L: 50, a: 50, b: 50 };
    const lab2 = { L: 50, a: 50, b: 50 };
    const { dE } = deltaE(lab1, lab2);
    expect(dE).toBe(0);
  });

  it("calculates Delta E correctly for different colors", () => {
    const red = rgbToLab({ r: 255, g: 0, b: 0 });
    const green = rgbToLab({ r: 0, g: 255, b: 0 });
    const { dE } = deltaE(red, green);
    expect(dE).toBeGreaterThan(80);
  });
});
