function j(v: number, amt = 1): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawRunway(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.35)';
  ctx.lineWidth = 0.8;

  // Runway edges converging toward horizon
  ctx.beginPath();
  ctx.moveTo(j(x), j(y));
  ctx.lineTo(j(x + width * 0.45), j(y - 40));
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(j(x + width), j(y));
  ctx.lineTo(j(x + width * 0.55), j(y - 40));
  ctx.stroke();

  // Center line dashes
  const dashCount = 6;
  for (let i = 0; i < dashCount; i++) {
    const t = i / dashCount;
    const cx = x + width * 0.5;
    const cy = y - t * 38;
    const dw = (1 - t) * 12;
    ctx.beginPath();
    ctx.moveTo(j(cx - dw * 0.5), j(cy));
    ctx.lineTo(j(cx + dw * 0.5), j(cy - 3));
    ctx.stroke();
  }

  ctx.restore();
}
