function j(v: number, amt = 1.5): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawCrane(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.7)';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';

  const topY = baseY - height;

  // Vertical mast
  ctx.beginPath();
  ctx.moveTo(j(x), j(baseY));
  ctx.lineTo(j(x), j(topY));
  ctx.stroke();

  // Horizontal jib (extends right)
  ctx.beginPath();
  ctx.moveTo(j(x), j(topY + height * 0.05));
  ctx.lineTo(j(x + height * 0.7), j(topY + height * 0.02));
  ctx.stroke();

  // Counter-jib (extends left, shorter)
  ctx.beginPath();
  ctx.moveTo(j(x), j(topY + height * 0.05));
  ctx.lineTo(j(x - height * 0.25), j(topY + height * 0.06));
  ctx.stroke();

  // Hoist line
  const hoistX = x + height * 0.4;
  ctx.beginPath();
  ctx.moveTo(j(hoistX), j(topY + height * 0.02));
  ctx.lineTo(j(hoistX + 3), j(baseY - height * 0.15));
  ctx.stroke();

  // Diagonal stays
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(j(x), j(topY + height * 0.05));
  ctx.lineTo(j(x + height * 0.35), j(topY + height * 0.02));
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}
