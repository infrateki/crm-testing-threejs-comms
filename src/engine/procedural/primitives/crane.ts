function j(v: number, amt = 1): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawCrane(
  ctx: CanvasRenderingContext2D,
  x: number, baseY: number, height: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.72)';
  ctx.lineCap = 'round';

  const topY = baseY - height;
  const mastW = 10;
  const jibLen = height * 0.68;
  const counterLen = height * 0.24;
  const jibY = topY + height * 0.055;

  // Mast — twin vertical lines (box section)
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.72;
  ctx.beginPath(); ctx.moveTo(j(x - mastW / 2), j(baseY)); ctx.lineTo(j(x - mastW / 2), j(topY)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(j(x + mastW / 2), j(baseY)); ctx.lineTo(j(x + mastW / 2), j(topY)); ctx.stroke();

  // Mast cross-bracing — alternating X every 18px
  ctx.lineWidth = 0.45;
  ctx.globalAlpha = 0.42;
  const braceH = 18;
  const braceCount = Math.floor(height / braceH);
  for (let b = 0; b < braceCount; b++) {
    const by1 = baseY - b * braceH;
    const by2 = baseY - (b + 1) * braceH;
    ctx.beginPath(); ctx.moveTo(j(x - mastW / 2), j(by1)); ctx.lineTo(j(x + mastW / 2), j(by2)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(j(x + mastW / 2), j(by1)); ctx.lineTo(j(x - mastW / 2), j(by2)); ctx.stroke();
  }

  // Operator cab at top
  ctx.lineWidth = 0.9;
  ctx.globalAlpha = 0.65;
  ctx.beginPath(); ctx.rect(j(x - 10), j(topY - 4), 20, 14); ctx.stroke();
  // Cab window
  ctx.lineWidth = 0.4;
  ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.rect(j(x - 6), j(topY - 1), 8, 6); ctx.stroke();

  // Jib (boom) — twin rails extending right
  ctx.lineWidth = 0.9;
  ctx.globalAlpha = 0.68;
  ctx.beginPath(); ctx.moveTo(j(x - mastW / 2), j(jibY - 1)); ctx.lineTo(j(x + jibLen), j(jibY + 2)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(j(x - mastW / 2), j(jibY + 8)); ctx.lineTo(j(x + jibLen), j(jibY + 11)); ctx.stroke();

  // Jib cross-bracing
  ctx.lineWidth = 0.38;
  ctx.globalAlpha = 0.38;
  const jibSegs = 9;
  for (let jb = 0; jb < jibSegs; jb++) {
    const jbx1 = x + (jibLen / jibSegs) * jb;
    const jbx2 = x + (jibLen / jibSegs) * (jb + 1);
    ctx.beginPath(); ctx.moveTo(j(jbx1), j(jibY)); ctx.lineTo(j(jbx2), j(jibY + 9)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(j(jbx1), j(jibY + 9)); ctx.lineTo(j(jbx2), j(jibY)); ctx.stroke();
  }

  // Counter-jib — twin rails extending left
  ctx.lineWidth = 0.9;
  ctx.globalAlpha = 0.65;
  ctx.beginPath(); ctx.moveTo(j(x + mastW / 2), j(jibY)); ctx.lineTo(j(x - counterLen), j(jibY + 2)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(j(x + mastW / 2), j(jibY + 7)); ctx.lineTo(j(x - counterLen), j(jibY + 9)); ctx.stroke();

  // Counterweight block
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.58;
  ctx.beginPath(); ctx.rect(j(x - counterLen - 16), j(jibY - 1), 16, 14); ctx.stroke();

  // Stay cables (from cab-top to jib ends)
  ctx.lineWidth = 0.55;
  ctx.globalAlpha = 0.38;
  ctx.beginPath(); ctx.moveTo(j(x), j(topY)); ctx.lineTo(j(x + jibLen), j(jibY + 3)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(j(x), j(topY)); ctx.lineTo(j(x - counterLen), j(jibY + 2)); ctx.stroke();
  // Mid-span stay
  ctx.beginPath(); ctx.moveTo(j(x), j(topY)); ctx.lineTo(j(x + jibLen * 0.55), j(jibY + 5)); ctx.stroke();

  // Trolley on jib
  const trolleyX = x + jibLen * 0.52;
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.rect(j(trolleyX - 4), j(jibY + 3), 8, 6); ctx.stroke();

  // Hoist cable
  ctx.lineWidth = 0.45;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(j(trolleyX), j(jibY + 9));
  ctx.lineTo(j(trolleyX + 2), j(baseY - height * 0.18));
  ctx.stroke();

  // Hook
  ctx.lineWidth = 0.7;
  ctx.globalAlpha = 0.55;
  const hookY = baseY - height * 0.18;
  ctx.beginPath();
  ctx.moveTo(j(trolleyX + 2), j(hookY));
  ctx.arc(j(trolleyX + 4), j(hookY + 4), 4, Math.PI, Math.PI * 1.85);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}
