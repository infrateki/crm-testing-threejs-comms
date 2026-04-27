export interface SobelResult {
  magnitude: Float32Array;
  direction: Float32Array;
}

export function sobelEdges(data: Float32Array, width: number, height: number): SobelResult {
  const magnitude = new Float32Array(width * height);
  const direction = new Float32Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tl = data[(y - 1) * width + (x - 1)];
      const tc = data[(y - 1) * width + x];
      const tr = data[(y - 1) * width + (x + 1)];
      const ml = data[y * width + (x - 1)];
      const mr = data[y * width + (x + 1)];
      const bl = data[(y + 1) * width + (x - 1)];
      const bc = data[(y + 1) * width + x];
      const br = data[(y + 1) * width + (x + 1)];

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;

      const idx = y * width + x;
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy);
      direction[idx] = Math.atan2(gy, gx);
    }
  }

  return { magnitude, direction };
}
