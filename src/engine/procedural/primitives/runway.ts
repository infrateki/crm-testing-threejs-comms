function j(v: number, amt = 1): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawRunway(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, width: number
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(26,26,26,0.45)';

  const vanishX = x + width * 0.5;
  const vanishY = y - 58;

  // Runway edge lines — perspective converging
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(j(x, 1.5), j(y, 1.5)); ctx.lineTo(j(vanishX - 13), j(vanishY)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(j(x + width, 1.5), j(y, 1.5)); ctx.lineTo(j(vanishX + 13), j(vanishY)); ctx.stroke();

  // Threshold markings (8 wide bars at near end)
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.38;
  const barW = width * 0.065;
  const barGap = barW * 0.28;
  for (let i = 0; i < 8; i++) {
    const bx = x + width * 0.09 + i * (barW + barGap);
    if (bx + barW > x + width * 0.91) break;
    ctx.beginPath();
    ctx.moveTo(j(bx), j(y - 5));
    ctx.lineTo(j(bx + barW), j(y - 5));
    ctx.stroke();
  }

  // Center-line dashes — perspective-correct
  const dashCount = 10;
  for (let i = 0; i < dashCount; i++) {
    const t = i / (dashCount - 1);
    const cy = y - t * (y - vanishY);
    const dw = (1 - t * 0.78) * width * 0.028;
    const dh = (1 - t * 0.6) * 7;
    ctx.lineWidth = (1 - t * 0.55) * 1.1;
    ctx.globalAlpha = 0.32 * (1 - t * 0.45);
    ctx.beginPath();
    ctx.moveTo(j(vanishX - dw * 0.5), j(cy));
    ctx.lineTo(j(vanishX + dw * 0.5), j(cy - dh));
    ctx.stroke();
  }

  // Touchdown zone markings (pairs of bars)
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.22;
  for (let tz = 0; tz < 3; tz++) {
    const tzy = y - (tz + 1) * 12;
    const spread = width * (0.38 - tz * 0.06);
    ctx.beginPath(); ctx.moveTo(j(vanishX - spread), j(tzy)); ctx.lineTo(j(vanishX - spread + 22), j(tzy - 2)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(j(vanishX + spread - 22), j(tzy)); ctx.lineTo(j(vanishX + spread), j(tzy - 2)); ctx.stroke();
  }

  // Edge lights — small dots on both sides
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const ly = y - t * (y - vanishY);
    const spread = width * (0.5 - t * 0.42);
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(j(vanishX - spread), j(ly), 2 * (1 - t * 0.45), 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(j(vanishX + spread), j(ly), 2 * (1 - t * 0.45), 0, Math.PI * 2); ctx.stroke();
  }

  // Subtle runway surface diagonal texture
  ctx.globalAlpha = 0.035;
  ctx.lineWidth = 0.4;
  for (let hx = x - 20; hx < x + width + 20; hx += 18) {
    ctx.beginPath();
    ctx.moveTo(j(hx), j(y + 2));
    ctx.lineTo(j(hx + 12), j(vanishY));
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}
