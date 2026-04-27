// Runs on main thread — writes final ink-on-paper image to canvas
export function paperComposite(
  ctx: CanvasRenderingContext2D,
  edges: Float32Array,
  width: number,
  height: number,
  paperColor: string = '#FAF8F3'
): void {
  // Fill paper background
  ctx.fillStyle = paperColor;
  ctx.fillRect(0, 0, width, height);

  // Write ink layer
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Parse ink color (#1a1a1a)
  const inkR = 26, inkG = 26, inkB = 26;

  for (let i = 0; i < edges.length; i++) {
    const alpha = edges[i];
    if (alpha <= 0) continue;
    const p = i * 4;
    // Alpha-composite ink over whatever is in paper (already filled)
    data[p]     = inkR;
    data[p + 1] = inkG;
    data[p + 2] = inkB;
    data[p + 3] = Math.round(alpha * 255);
  }

  ctx.putImageData(imageData, 0, 0);

  // Paper grain noise ±3 per channel
  const grainData = ctx.getImageData(0, 0, width, height);
  const gd = grainData.data;
  for (let i = 0; i < gd.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    gd[i]     = Math.max(0, Math.min(255, gd[i]     + n));
    gd[i + 1] = Math.max(0, Math.min(255, gd[i + 1] + n));
    gd[i + 2] = Math.max(0, Math.min(255, gd[i + 2] + n));
  }
  ctx.putImageData(grainData, 0, 0);
}
