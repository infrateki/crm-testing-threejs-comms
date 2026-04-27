function j(v: number, amt = 2): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawPalmTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.75)';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';

  // Trunk — slightly curved
  ctx.beginPath();
  ctx.moveTo(j(x), j(y));
  ctx.bezierCurveTo(j(x + 5), j(y - height * 0.4), j(x - 4), j(y - height * 0.7), j(x + 3), j(y - height));
  ctx.stroke();

  // Fronds
  const tipX = x + 3;
  const tipY = y - height;
  const frondCount = 7;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const len = height * 0.38;
    ctx.beginPath();
    ctx.moveTo(j(tipX), j(tipY));
    const ex = tipX + Math.cos(angle) * len;
    const ey = tipY + Math.sin(angle) * len * 0.5 + len * 0.2;
    ctx.bezierCurveTo(
      j(tipX + Math.cos(angle) * len * 0.4), j(tipY + Math.sin(angle) * len * 0.3),
      j(ex - 5), j(ey - 5),
      j(ex), j(ey)
    );
    ctx.globalAlpha = 0.55 + Math.random() * 0.3;
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
