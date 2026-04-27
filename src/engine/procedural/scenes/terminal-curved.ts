import { drawPalmTree } from '../primitives/palm-tree';
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

// MIA South Terminal — curved roof, palm trees, jet bridges, tarmac
export function drawTerminalCurved(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  // Paper background
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);

  const horizY = h * 0.62;

  // Sky — subtle gradient wash
  const sky = ctx.createLinearGradient(0, 0, 0, horizY);
  sky.addColorStop(0, 'rgba(26,26,26,0.03)');
  sky.addColorStop(1, 'rgba(26,26,26,0.0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizY);

  ctx.strokeStyle = 'rgba(26,26,26,0.8)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Terminal roof — large sweeping arc
  ctx.beginPath();
  ctx.moveTo(j(w * 0.05), j(horizY - 30));
  ctx.bezierCurveTo(
    j(w * 0.2), j(horizY - 120),
    j(w * 0.5), j(horizY - 145),
    j(w * 0.95), j(horizY - 25)
  );
  ctx.lineWidth = 2;
  ctx.stroke();

  // Roof underside / ceiling line
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(j(w * 0.08), j(horizY - 20));
  ctx.bezierCurveTo(
    j(w * 0.25), j(horizY - 100),
    j(w * 0.5), j(horizY - 120),
    j(w * 0.92), j(horizY - 15)
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Facade columns — 8 evenly spaced
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const cx = w * 0.08 + i * (w * 0.84 / 7);
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(j(cx), j(horizY));
    ctx.lineTo(j(cx + 1), j(horizY - 80 - Math.sin((i / 7) * Math.PI) * 40));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ground / tarmac
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(26,26,26,0.4)';
  ctx.beginPath();
  ctx.moveTo(j(0), j(horizY));
  ctx.lineTo(j(w), j(horizY));
  ctx.stroke();

  // Tarmac texture lines
  for (let i = 0; i < 5; i++) {
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(0, horizY + i * 18);
    ctx.lineTo(w, horizY + i * 18 + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Runway
  drawRunway(ctx, w * 0.1, h * 0.9, w * 0.5);

  // Jet bridges
  drawJetBridge(ctx, w * 0.35, horizY, 80, 0.3);
  drawJetBridge(ctx, w * 0.6, horizY, 75, 0.4);

  // Palm trees (MIA signature)
  drawPalmTree(ctx, w * 0.05, h * 0.85, 90);
  drawPalmTree(ctx, w * 0.88, h * 0.88, 75);
  drawPalmTree(ctx, w * 0.93, h * 0.82, 60);

  addGrain(ctx, w, h);
}
