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

// Federal / SAM.gov — neoclassical columns, steps, cranes in bg
export function drawFederalBuilding(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);

  const baseY = h * 0.75;
  const buildingW = w * 0.6;
  const buildingX = (w - buildingW) / 2;
  const buildingH = h * 0.45;
  const buildingTop = baseY - buildingH;

  ctx.strokeStyle = 'rgba(26,26,26,0.82)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Main facade rectangle
  ctx.beginPath();
  ctx.rect(j(buildingX), j(buildingTop), j(buildingW, 1), j(buildingH, 1));
  ctx.stroke();

  // Pediment / triangular top
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(j(buildingX - 10), j(buildingTop));
  ctx.lineTo(j(buildingX + buildingW * 0.5), j(buildingTop - 45));
  ctx.lineTo(j(buildingX + buildingW + 10), j(buildingTop));
  ctx.stroke();

  // Columns — 8 across facade
  const colCount = 8;
  const colSpacing = buildingW / (colCount + 1);
  ctx.lineWidth = 1.2;
  for (let i = 0; i < colCount; i++) {
    const cx = buildingX + colSpacing * (i + 1);
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(j(cx), j(baseY));
    ctx.lineTo(j(cx + 1), j(buildingTop + 2));
    ctx.stroke();
    // Column capital
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(j(cx - 6), j(buildingTop + 3));
    ctx.lineTo(j(cx + 6), j(buildingTop + 3));
    ctx.stroke();
    ctx.lineWidth = 1.2;
  }
  ctx.globalAlpha = 1;

  // Steps leading up
  const stepCount = 5;
  const stepH = 8;
  const stepW = buildingW + 20;
  for (let s = 0; s < stepCount; s++) {
    const sy = baseY + s * stepH;
    const sw = stepW + s * 12;
    const sx = (w - sw) / 2;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(j(sx), j(sy));
    ctx.lineTo(j(sx + sw), j(sy));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ground line
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(26,26,26,0.4)';
  ctx.beginPath();
  ctx.moveTo(0, baseY + stepCount * stepH);
  ctx.lineTo(w, baseY + stepCount * stepH);
  ctx.stroke();

  // Construction cranes in background
  ctx.strokeStyle = 'rgba(26,26,26,0.7)';
  drawCrane(ctx, w * 0.1, baseY, h * 0.55);
  drawCrane(ctx, w * 0.82, baseY, h * 0.48);

  addGrain(ctx, w, h);
}
