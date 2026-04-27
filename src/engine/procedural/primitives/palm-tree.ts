function j(v: number, amt = 1.5): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, height: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.78)';
  ctx.lineCap = 'round';

  const tipX = x + j(height * 0.08, 4);
  const tipY = y - height;
  const midX = x + j(height * 0.1, 3);
  const midY = y - height * 0.52;

  // Trunk — thick base tapering to thin tip
  ctx.lineWidth = j(2.8, 0.4);
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(j(x - 3), j(y));
  ctx.bezierCurveTo(j(x + 6), j(y - height * 0.28), j(midX - 2), j(midY + 10), j(tipX), j(tipY));
  ctx.stroke();

  // Bark texture — short horizontal strokes
  const segments = Math.floor(height / 7);
  for (let i = 2; i < segments; i++) {
    const t = i / segments;
    const bx = x + (tipX - x) * t * 0.8;
    const by = y - height * t;
    const bw = (3.5 - t * 2.8) * 1.6;
    ctx.lineWidth = 0.35 + Math.random() * 0.25;
    ctx.globalAlpha = 0.18 + Math.random() * 0.18;
    ctx.beginPath();
    ctx.moveTo(j(bx - bw), j(by - 1));
    ctx.lineTo(j(bx + bw), j(by));
    ctx.stroke();
  }

  // Crown fronds — 11 individual fronds
  const frondCount = 11;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2 - Math.PI * 0.45;
    const len = height * (0.36 + Math.random() * 0.09);
    const droop = 0.28 + Math.random() * 0.22;
    const ex = tipX + Math.cos(angle) * len;
    const ey = tipY + Math.sin(angle) * len * 0.55 + len * droop;
    const cpx = tipX + Math.cos(angle) * len * 0.45;
    const cpy = tipY + Math.sin(angle) * len * 0.32;

    ctx.lineWidth = 0.9 + Math.random() * 0.5;
    ctx.globalAlpha = 0.52 + Math.random() * 0.32;
    ctx.strokeStyle = 'rgba(26,26,26,0.78)';
    ctx.beginPath();
    ctx.moveTo(j(tipX), j(tipY));
    ctx.bezierCurveTo(j(cpx), j(cpy), j(ex - 4), j(ey - 4), j(ex), j(ey));
    ctx.stroke();

    // Leaflets — 6 small secondary lines along frond
    for (let l = 1; l <= 6; l++) {
      const lt = l / 7;
      const lx = tipX + (ex - tipX) * lt;
      const ly = tipY + (ey - tipY) * lt + (ey - cpy) * lt * lt * 0.3;
      const side = l % 2 === 0 ? 1 : -1;
      const la = angle + side * (0.55 + Math.random() * 0.3);
      const ll = len * (0.1 + Math.random() * 0.06) * (1 - lt * 0.4);
      ctx.lineWidth = 0.28 + Math.random() * 0.2;
      ctx.globalAlpha = 0.22 + Math.random() * 0.15;
      ctx.beginPath();
      ctx.moveTo(j(lx), j(ly));
      ctx.lineTo(j(lx + Math.cos(la) * ll), j(ly + Math.sin(la) * ll));
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
