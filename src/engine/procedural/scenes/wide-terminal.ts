import { drawRunway } from '../primitives/runway';
import { drawJetBridge } from '../primitives/jet-bridge';
import { drawCrane } from '../primitives/crane';

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

// DFW — wide horizontal terminal, multiple gate piers, control tower
export function drawWideTerminal(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);

  const horizY = h * 0.58;

  ctx.strokeStyle = 'rgba(26,26,26,0.78)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Main terminal body — wide low rectangle
  const tW = w * 0.88;
  const tH = h * 0.22;
  const tX = w * 0.06;
  const tY = horizY - tH;

  ctx.beginPath();
  ctx.rect(j(tX), j(tY), j(tW, 1), j(tH, 1));
  ctx.stroke();

  // Flat roof detail line
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(j(tX), j(tY + 8));
  ctx.lineTo(j(tX + tW), j(tY + 8));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gate piers extending down (5 of them)
  const pierCount = 5;
  for (let i = 0; i < pierCount; i++) {
    const px = tX + (i + 1) * (tW / (pierCount + 1));
    const pW = 18;
    const pH = h * 0.28;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.rect(j(px - pW / 2), j(horizY), j(pW, 1), j(pH, 2));
    ctx.stroke();
    drawJetBridge(ctx, px + pW / 2, horizY + pH * 0.5, 55, 0.2 + i * 0.05);
  }
  ctx.globalAlpha = 1;

  // Control tower (right side)
  const towerX = tX + tW - 40;
  const towerBaseY = tY;
  const towerH = h * 0.35;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(26,26,26,0.85)';
  ctx.beginPath();
  ctx.rect(j(towerX), j(towerBaseY - towerH), 16, j(towerH, 1));
  ctx.stroke();
  // Tower cab
  ctx.beginPath();
  ctx.arc(j(towerX + 8), j(towerBaseY - towerH - 10), 12, 0, Math.PI * 2);
  ctx.stroke();

  // Ground and runway
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(26,26,26,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, horizY);
  ctx.lineTo(w, horizY);
  ctx.stroke();

  drawRunway(ctx, w * 0.05, h * 0.88, w * 0.6);

  drawCrane(ctx, w * 0.05, horizY, h * 0.4);

  addGrain(ctx, w, h);
}
