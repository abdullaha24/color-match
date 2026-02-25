export interface RGB {
  r: number;
  g: number;
  b: number;
} // 0-255 each

export interface XYZ {
  x: number;
  y: number;
  z: number;
}

export interface Lab {
  L: number;
  a: number;
  b: number;
}

export interface DeltaComponents {
  dL: number;
  da: number;
  db: number;
  dE: number;
}

// ── D65 Reference White ───────────────────────────────────────
const REF_X = 95.047;
const REF_Y = 100.0;
const REF_Z = 108.883;

// ── Part 1: RGB → XYZ ────────────────────────────────────────
function inverseGamma(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function rgbToXyz(rgb: RGB): XYZ {
  const rLin = inverseGamma(rgb.r / 255);
  const gLin = inverseGamma(rgb.g / 255);
  const bLin = inverseGamma(rgb.b / 255);

  return {
    x: (rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375) * 100,
    y: (rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.072175) * 100,
    z: (rLin * 0.0193339 + gLin * 0.119192 + bLin * 0.9503041) * 100,
  };
}

// ── Part 2: XYZ → L*a*b* ─────────────────────────────────────
function labTransform(t: number): number {
  return t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
}

export function xyzToLab(xyz: XYZ): Lab {
  const fX = labTransform(xyz.x / REF_X);
  const fY = labTransform(xyz.y / REF_Y);
  const fZ = labTransform(xyz.z / REF_Z);

  return {
    L: 116 * fY - 16,
    a: 500 * (fX - fY),
    b: 200 * (fY - fZ),
  };
}

// ── Convenience: RGB → L*a*b* ─────────────────────────────────
export function rgbToLab(rgb: RGB): Lab {
  return xyzToLab(rgbToXyz(rgb));
}

// ── Part 3: Delta E (CIE76) ──────────────────────────────────
export function deltaE(target: Lab, current: Lab): DeltaComponents {
  const dL = target.L - current.L;
  const da = target.a - current.a;
  const db = target.b - current.b;
  const dE = Math.sqrt(dL * dL + da * da + db * db);

  return { dL, da, db, dE };
}
