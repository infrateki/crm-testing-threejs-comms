// Apply gradient alpha feathering at layer boundaries
export function alphaFeather(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startY: number,
  endY: number,
  feather: number
): void {
  for (let y = 0; y < height; y++) {
    const yNorm = y / height;
    let alpha = 1;

    if (yNorm < startY || yNorm > endY) {
      alpha = 0;
    } else if (yNorm < startY + feather) {
      alpha = (yNorm - startY) / feather;
    } else if (yNorm > endY - feather) {
      alpha = (endY - yNorm) / feather;
    }

    if (alpha >= 1) continue;
    const a = Math.max(0, Math.min(1, alpha));
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx + 3] = Math.round(data[idx + 3] * a);
    }
  }
}
