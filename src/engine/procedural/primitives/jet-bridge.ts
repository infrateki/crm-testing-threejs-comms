function j(v: number, amt = 1.5): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawJetBridge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  length: number,
  angle: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.65)';
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';

  const ex = x + Math.cos(angle) * length;
  const ey = y + Math.sin(angle) * length;

  // Main tube
  ctx.beginPath();
  ctx.moveTo(j(x), j(y));
  ctx.lineTo(j(ex), j(ey));
  ctx.stroke();

  // Support legs
  const legCount = 3;
  for (let i = 1; i <= legCount; i++) {
    const t = i / (legCount + 1);
    const lx = x + Math.cos(angle) * length * t;
    const ly = y + Math.sin(angle) * length * t;
    ctx.lineWidth = 0.7;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(j(lx), j(ly));
    ctx.lineTo(j(lx + 2), j(ly + 18));
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
