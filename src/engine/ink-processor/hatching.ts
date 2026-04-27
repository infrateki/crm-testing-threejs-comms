export function applyHatching(
  edges: Float32Array,
  grayscale: Float32Array,
  direction: Float32Array,
  width: number,
  height: number
): Float32Array {
  const out = new Float32Array(edges);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (grayscale[idx] >= 80) continue;

      // Shadow density drives hatch spacing (darker = tighter hatching)
      const darkness = 1 - grayscale[idx] / 80;
      const spacing = Math.max(3, Math.round(8 - darkness * 5));

      // Primary diagonal: 45°
      if ((x + y) % spacing === 0) {
        const opacity = darkness * 0.45;
        out[idx] = Math.min(1, out[idx] + opacity);
      }

      // Cross-hatch in very dark regions, oriented with Sobel direction
      if (grayscale[idx] < 40) {
        const angle = direction[idx];
        const perpX = Math.round(Math.cos(angle + Math.PI / 2));
        const perpY = Math.round(Math.sin(angle + Math.PI / 2));
        const proj = x * perpX + y * perpY;
        if (proj % (spacing + 2) === 0) {
          out[idx] = Math.min(1, out[idx] + darkness * 0.3);
        }
      }
    }
  }

  return out;
}
