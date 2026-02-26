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

// ── Part 4: L*a*b* → XYZ ─────────────────────────────────────
function inverseLabTransform(t: number): number {
  const t3 = t * t * t;
  return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
}

export function labToXyz(lab: Lab): XYZ {
  const y = (lab.L + 16) / 116;
  const x = lab.a / 500 + y;
  const z = y - lab.b / 200;

  return {
    x: inverseLabTransform(x) * REF_X,
    y: inverseLabTransform(y) * REF_Y,
    z: inverseLabTransform(z) * REF_Z,
  };
}

// ── Part 5: XYZ → RGB ────────────────────────────────────────
function gammaCorrect(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function clamp(value: number): number {
  const v = Math.round(value * 255);
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}

export function xyzToRgb(xyz: XYZ): RGB {
  const xN = xyz.x / 100;
  const yN = xyz.y / 100;
  const zN = xyz.z / 100;

  const rLin = xN * 3.2404542 + yN * -1.5371385 + zN * -0.4985314;
  const gLin = xN * -0.969266 + yN * 1.8760108 + zN * 0.041556;
  const bLin = xN * 0.0556434 + yN * -0.2040259 + zN * 1.0572252;

  return {
    r: clamp(gammaCorrect(rLin)),
    g: clamp(gammaCorrect(gLin)),
    b: clamp(gammaCorrect(bLin)),
  };
}

// ── Convenience: L*a*b* → RGB ─────────────────────────────────
export function labToRgb(lab: Lab): RGB {
  return xyzToRgb(labToXyz(lab));
}

// ── Part 3: Delta E (CIEDE2000) ──────────────────────────────
export function deltaE(target: Lab, current: Lab): DeltaComponents {
  // Raw L*a*b* deltas (kept for the UI — signed directional differences)
  const dL = target.L - current.L;
  const da = target.a - current.a;
  const db = target.b - current.b;

  // Alias inputs for clarity inside the algorithm
  const L1 = target.L,
    a1 = target.a,
    b1 = target.b;
  const L2 = current.L,
    a2 = current.a,
    b2 = current.b;

  const PI = Math.PI;
  const kL = 1.0,
    kC = 1.0,
    kH = 1.0;

  // Step 1: Chroma and average chroma
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const C_bar = (C1 + C2) / 2;

  // Step 2: G (a* axis adjustment)
  const C_bar_pow7 = Math.pow(C_bar, 7);
  const G = 0.5 * (1 - Math.sqrt(C_bar_pow7 / (C_bar_pow7 + Math.pow(25, 7))));

  // Step 3: a', C', and average C'
  const a1_prime = a1 * (1 + G);
  const a2_prime = a2 * (1 + G);

  const C1_prime = Math.sqrt(a1_prime * a1_prime + b1 * b1);
  const C2_prime = Math.sqrt(a2_prime * a2_prime + b2 * b2);
  const C_bar_prime = (C1_prime + C2_prime) / 2;

  // Step 4: h' (hue angle in degrees)
  function calcH(a_p: number, b_p: number): number {
    if (a_p === 0 && b_p === 0) return 0;
    let h = Math.atan2(b_p, a_p) * (180 / PI);
    if (h < 0) h += 360;
    return h;
  }
  const h1_prime = calcH(a1_prime, b1);
  const h2_prime = calcH(a2_prime, b2);

  // Step 5: Deltas
  const dL_prime = L2 - L1;
  const dC_prime = C2_prime - C1_prime;

  let dh_prime: number;
  if (C1_prime * C2_prime === 0) {
    dh_prime = 0;
  } else {
    const h_diff = h2_prime - h1_prime;
    if (Math.abs(h_diff) <= 180) {
      dh_prime = h_diff;
    } else if (h_diff > 180) {
      dh_prime = h_diff - 360;
    } else {
      dh_prime = h_diff + 360;
    }
  }

  const dH_prime =
    2 * Math.sqrt(C1_prime * C2_prime) * Math.sin((dh_prime / 2) * (PI / 180));

  // Step 6: Averages for L and H
  const L_bar_prime = (L1 + L2) / 2;

  let H_bar_prime: number;
  if (C1_prime * C2_prime === 0) {
    H_bar_prime = h1_prime + h2_prime;
  } else {
    const h_sum = h1_prime + h2_prime;
    if (Math.abs(h1_prime - h2_prime) <= 180) {
      H_bar_prime = h_sum / 2;
    } else if (h_sum < 360) {
      H_bar_prime = (h_sum + 360) / 2;
    } else {
      H_bar_prime = (h_sum - 360) / 2;
    }
  }

  // Step 7: T
  const T =
    1 -
    0.17 * Math.cos(((H_bar_prime - 30) * PI) / 180) +
    0.24 * Math.cos((2 * H_bar_prime * PI) / 180) +
    0.32 * Math.cos(((3 * H_bar_prime + 6) * PI) / 180) -
    0.2 * Math.cos(((4 * H_bar_prime - 63) * PI) / 180);

  // Step 8: Rotation term
  const d_theta = 30 * Math.exp(-1 * Math.pow((H_bar_prime - 275) / 25, 2));
  const C_bar_prime_pow7 = Math.pow(C_bar_prime, 7);
  const R_C =
    2 * Math.sqrt(C_bar_prime_pow7 / (C_bar_prime_pow7 + Math.pow(25, 7)));
  const R_T = -1 * Math.sin((2 * d_theta * PI) / 180) * R_C;

  // Step 9: Compensation terms
  const L_diff_sq = Math.pow(L_bar_prime - 50, 2);
  const S_L = 1 + (0.015 * L_diff_sq) / Math.sqrt(20 + L_diff_sq);
  const S_C = 1 + 0.045 * C_bar_prime;
  const S_H = 1 + 0.015 * C_bar_prime * T;

  // Step 10: Final ΔE2000
  const term1 = dL_prime / (kL * S_L);
  const term2 = dC_prime / (kC * S_C);
  const term3 = dH_prime / (kH * S_H);

  const dE = Math.sqrt(
    term1 * term1 + term2 * term2 + term3 * term3 + R_T * term2 * term3,
  );

  return { dL, da, db, dE };
}
