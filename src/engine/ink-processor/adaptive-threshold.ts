export function adaptiveThreshold(magnitude: Float32Array, threshold: number): Uint8Array {
  // Find max magnitude for normalization
  let max = 0;
  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] > max) max = magnitude[i];
  }
  if (max === 0) return new Uint8Array(magnitude.length);

  const out = new Uint8Array(magnitude.length);
  const scale = 255 / max;
  for (let i = 0; i < magnitude.length; i++) {
    out[i] = magnitude[i] * scale > threshold ? 1 : 0;
  }
  return out;
}
