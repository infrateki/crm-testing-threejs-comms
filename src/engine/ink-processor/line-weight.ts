import type { LineWeight } from './types';

const WEIGHT_RANGES: Record<LineWeight, [number, number]> = {
  heavy:  [0.60, 1.00],
  medium: [0.45, 0.85],
  light:  [0.35, 0.65],
};

export function applyLineWeight(
  magnitude: Float32Array,
  thresholded: Uint8Array,
  weight: LineWeight
): Float32Array {
  const [minOp, maxOp] = WEIGHT_RANGES[weight];
  const out = new Float32Array(magnitude.length);

  let max = 0;
  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] > max) max = magnitude[i];
  }
  if (max === 0) return out;

  for (let i = 0; i < out.length; i++) {
    if (thresholded[i] === 0) continue;
    const norm = magnitude[i] / max;
    out[i] = minOp + norm * (maxOp - minOp);
  }
  return out;
}
