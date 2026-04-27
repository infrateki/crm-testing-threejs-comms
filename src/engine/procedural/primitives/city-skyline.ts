function j(v: number, amt = 1.5): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawCitySkyline(
  ctx: CanvasRenderingContext2D,
  startX: number,
  baseY: number,
  totalWidth: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.45)';
  ctx.lineWidth = 0.8;

  const buildings = [
    { relX: 0.02, w: 28, h: 70 },
    { relX: 0.08, w: 20, h: 90 },
    { relX: 0.13, w: 35, h: 55 },
    { relX: 0.20, w: 18, h: 110 },
    { relX: 0.26, w: 25, h: 75 },
    { relX: 0.33, w: 30, h: 60 },
    { relX: 0.40, w: 22, h: 95 },
    { relX: 0.48, w: 40, h: 50 },
    { relX: 0.56, w: 16, h: 120 },
    { relX: 0.63, w: 28, h: 80 },
    { relX: 0.70, w: 24, h: 65 },
    { relX: 0.77, w: 32, h: 45 },
    { relX: 0.85, w: 20, h: 85 },
    { relX: 0.91, w: 26, h: 58 },
  ];

  for (const b of buildings) {
    const bx = startX + b.relX * totalWidth;
    const by = baseY - b.h;
    ctx.globalAlpha = 0.3 + Math.random() * 0.2;
    ctx.beginPath();
    ctx.rect(j(bx), j(by), j(b.w, 1), j(b.h, 2));
    ctx.stroke();

    // Random windows
    const winRows = Math.floor(b.h / 12);
    const winCols = Math.floor(b.w / 8);
    ctx.lineWidth = 0.4;
    ctx.globalAlpha = 0.15;
    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        if (Math.random() > 0.5) continue;
        ctx.beginPath();
        ctx.rect(bx + c * 8 + 1, by + r * 12 + 2, 5, 7);
        ctx.stroke();
      }
    }
    ctx.lineWidth = 0.8;
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
