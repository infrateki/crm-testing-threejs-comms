import { drawJetBridge } from '../primitives/jet-bridge';
import { drawRunway } from '../primitives/runway';

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

// MCO — curved atrium tower, circular elements, people mover/tram
export function drawCurvedTower(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);

  const horizY = h * 0.65;
  ctx.strokeStyle = 'rgba(26,26,26,0.8)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Central atrium tower — curved sides
  const cx = w * 0.5;
  const towerTop = h * 0.08;
  const towerW = w * 0.18;

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(j(cx - towerW / 2), j(horizY));
  ctx.bezierCurveTo(
    j(cx - towerW / 2 - 15), j(horizY - (horizY - towerTop) * 0.4),
    j(cx - towerW / 2 - 5),  j(towerTop + 20),
    j(cx), j(towerTop)
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(j(cx + towerW / 2), j(horizY));
  ctx.bezierCurveTo(
    j(cx + towerW / 2 + 15), j(horizY - (horizY - towerTop) * 0.4),
    j(cx + towerW / 2 + 5),  j(towerTop + 20),
    j(cx), j(towerTop)
  );
  ctx.stroke();

  // Circular atrium rings (horizontal ellipses)
  const ringCount = 5;
  for (let r = 0; r < ringCount; r++) {
    const t = r / ringCount;
    const ry = towerTop + t * (horizY - towerTop);
    const rw = (towerW * 0.35) * (1 - t * 0.3);
    ctx.lineWidth = 0.7;
    ctx.globalAlpha = 0.35 + t * 0.2;
    ctx.beginPath();
    ctx.ellipse(j(cx), j(ry), j(rw, 1), j(rw * 0.25, 1), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Satellite terminal wings
  const wingW = w * 0.28;
  const wingH = h * 0.14;
  const wingY = horizY - wingH;

  // Left wing
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(j(w * 0.06), j(wingY), j(wingW, 1), j(wingH, 1));
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.rect(j(w * 0.66), j(wingY), j(wingW, 1), j(wingH, 1));
  ctx.stroke();

  // People mover / tram track between terminal and wings
  ctx.lineWidth = 0.8;
  ctx.setLineDash([6, 4]);
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(j(w * 0.34), j(horizY - 10));
  ctx.lineTo(j(w * 0.12), j(horizY - 10));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(j(w * 0.66), j(horizY - 10));
  ctx.lineTo(j(w * 0.88), j(horizY - 10));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // Jet bridges
  drawJetBridge(ctx, w * 0.22, wingY + wingH * 0.6, 60, 0.25);
  drawJetBridge(ctx, w * 0.72, wingY + wingH * 0.6, 55, -0.2);

  // Ground and runway
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(26,26,26,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, horizY);
  ctx.lineTo(w, horizY);
  ctx.stroke();

  drawRunway(ctx, w * 0.05, h * 0.9, w * 0.5);

  addGrain(ctx, w, h);
}
