import { drawCitySkyline } from '../primitives/city-skyline';
import { drawJetBridge } from '../primitives/jet-bridge';

function j(v: number, amt = 2): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

function addGrain(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const id = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    id.data[i]     = Math.max(0, Math.min(255, id.data[i]     + n));
    id.data[i + 1] = Math.max(0, Math.min(255, id.data[i + 1] + n));
    id.data[i + 2] = Math.max(0, Math.min(255, id.data[i + 2] + n));
  }
  ctx.putImageData(id, 0, 0);
}

// LGA — modern angular terminal, city skyline bg, water/bridge element
export function drawModernAngular(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);

  const horizY = h * 0.6;

  ctx.strokeStyle = 'rgba(26,26,26,0.8)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // City skyline in background
  drawCitySkyline(ctx, 0, horizY - 10, w);

  // Water / East River — wavy lines
  ctx.lineWidth = 0.6;
  for (let row = 0; row < 4; row++) {
    ctx.globalAlpha = 0.18 + row * 0.05;
    ctx.beginPath();
    const wy = horizY + 15 + row * 10;
    ctx.moveTo(0, j(wy));
    for (let x = 0; x < w; x += 30) {
      ctx.quadraticCurveTo(j(x + 15), j(wy - 4), j(x + 30), j(wy));
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Terminal — angular faceted form
  const tY = horizY - h * 0.3;
  const points: [number, number][] = [
    [w * 0.12, horizY],
    [w * 0.08, tY + 20],
    [w * 0.18, tY],
    [w * 0.72, tY],
    [w * 0.82, tY + 15],
    [w * 0.88, horizY],
  ];

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(26,26,26,0.85)';
  ctx.beginPath();
  ctx.moveTo(j(points[0][0]), j(points[0][1]));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(j(points[i][0]), j(points[i][1]));
  }
  ctx.stroke();

  // Facade glazing lines (horizontal)
  const panelCount = 5;
  ctx.lineWidth = 0.7;
  for (let p = 1; p < panelCount; p++) {
    const py = tY + (p / panelCount) * (horizY - tY);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(j(w * 0.12), j(py));
    ctx.lineTo(j(w * 0.88), j(py));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Jet bridges
  drawJetBridge(ctx, w * 0.3, horizY, 70, 0.15);
  drawJetBridge(ctx, w * 0.55, horizY, 65, 0.2);

  // Ground
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(26,26,26,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, horizY);
  ctx.lineTo(w, horizY);
  ctx.stroke();

  addGrain(ctx, w, h);
}
