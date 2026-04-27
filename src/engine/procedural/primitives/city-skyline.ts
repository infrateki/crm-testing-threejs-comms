function j(v: number, amt = 1.5): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

const BLDGS = [
  { r: 0.01, w: 32, h: 72, win: true },
  { r: 0.06, w: 16, h: 98, spire: true },
  { r: 0.10, w: 38, h: 52, win: true },
  { r: 0.17, w: 14, h: 118, spire: true },
  { r: 0.22, w: 26, h: 68, win: true },
  { r: 0.27, w: 20, h: 58 },
  { r: 0.31, w: 42, h: 44, win: true },
  { r: 0.38, w: 18, h: 106, spire: true },
  { r: 0.44, w: 14, h: 84, win: true },
  { r: 0.49, w: 30, h: 55, win: true },
  { r: 0.54, w: 12, h: 128, spire: true },
  { r: 0.59, w: 24, h: 72, win: true },
  { r: 0.64, w: 18, h: 90 },
  { r: 0.69, w: 46, h: 48, win: true },
  { r: 0.75, w: 16, h: 76 },
  { r: 0.79, w: 28, h: 62, win: true },
  { r: 0.84, w: 14, h: 104, spire: true },
  { r: 0.88, w: 36, h: 46, win: true },
  { r: 0.93, w: 20, h: 82, spire: true },
  { r: 0.97, w: 22, h: 54, win: true },
];

export function drawCitySkyline(
  ctx: CanvasRenderingContext2D,
  startX: number, baseY: number, totalWidth: number
): void {
  ctx.save();
  ctx.lineCap = 'round';

  for (const b of BLDGS) {
    const bx = startX + b.r * totalWidth;
    const by = baseY - b.h;
    const depthA = 0.18 + (b.h / 130) * 0.2;

    // Building outline
    ctx.strokeStyle = 'rgba(26,26,26,1)';
    ctx.lineWidth = 0.65;
    ctx.globalAlpha = depthA;
    ctx.beginPath();
    ctx.rect(j(bx), j(by), j(b.w, 0.4), j(b.h, 0.8));
    ctx.stroke();

    // Setback / step on taller buildings
    if (b.h > 80) {
      ctx.lineWidth = 0.45;
      ctx.globalAlpha = depthA * 0.7;
      ctx.beginPath();
      ctx.rect(j(bx + 4), j(by - 14), j(b.w - 8, 0.3), 14);
      ctx.stroke();
    }

    // Window grid
    if (b.win) {
      const cols = Math.max(1, Math.floor(b.w / 7));
      const rows = Math.max(1, Math.floor(b.h / 11));
      const ww = (b.w - 4) / cols;
      const wh = (b.h - 4) / rows;
      ctx.lineWidth = 0.28;
      ctx.globalAlpha = depthA * 0.58;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.48) continue;
          ctx.beginPath();
          ctx.rect(bx + 2 + c * ww + 1, by + 2 + r * wh + 1, ww - 3, wh - 3);
          ctx.stroke();
        }
      }
    }

    // Spire
    if (b.spire) {
      ctx.lineWidth = 0.75;
      ctx.globalAlpha = depthA * 1.15;
      const sh = b.h * 0.18;
      ctx.beginPath();
      ctx.moveTo(j(bx + b.w * 0.5 - 1.5), j(by));
      ctx.lineTo(j(bx + b.w * 0.5), j(by - sh));
      ctx.lineTo(j(bx + b.w * 0.5 + 1.5), j(by));
      ctx.stroke();
    }

    // Rooftop equipment
    if (Math.random() > 0.62) {
      ctx.lineWidth = 0.35;
      ctx.globalAlpha = depthA * 0.75;
      const eqX = bx + 3 + Math.random() * (b.w - 12);
      ctx.beginPath();
      ctx.rect(j(eqX), j(by - 9), j(7, 0.4), j(8, 0.3));
      ctx.stroke();
    }

    // Water tower silhouette (very tall buildings only)
    if (b.h > 95 && Math.random() > 0.55) {
      ctx.lineWidth = 0.35;
      ctx.globalAlpha = depthA * 0.65;
      const wtX = bx + b.w * 0.6;
      ctx.beginPath();
      ctx.moveTo(j(wtX - 3), j(by - 2));
      ctx.lineTo(j(wtX - 3), j(by - 14));
      ctx.lineTo(j(wtX + 3), j(by - 14));
      ctx.lineTo(j(wtX + 3), j(by - 2));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(j(wtX - 5), j(by - 14));
      ctx.bezierCurveTo(j(wtX - 5), j(by - 22), j(wtX + 5), j(by - 22), j(wtX + 5), j(by - 14));
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
