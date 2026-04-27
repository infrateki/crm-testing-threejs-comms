function j(v: number, amt = 1.5): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

export function drawJetBridge(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, length: number, angle: number
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(26,26,26,0.65)';
  ctx.lineCap = 'round';

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const ex = x + cos * length;
  const ey = y + sin * length;
  const bh = 14;

  // Perpendicular direction (bridge height/width)
  const perpCos = -sin;
  const perpSin = cos;

  // Top and bottom rails
  ctx.lineWidth = 1.0;
  ctx.globalAlpha = 0.68;
  ctx.beginPath();
  ctx.moveTo(j(x + perpCos * bh / 2), j(y + perpSin * bh / 2));
  ctx.lineTo(j(ex + perpCos * bh / 2), j(ey + perpSin * bh / 2));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(j(x - perpCos * bh / 2), j(y - perpSin * bh / 2));
  ctx.lineTo(j(ex - perpCos * bh / 2), j(ey - perpSin * bh / 2));
  ctx.stroke();

  // Accordion bellows — zigzag transverse lines
  const bellowCount = Math.max(4, Math.floor(length / 9));
  ctx.lineWidth = 0.45;
  ctx.globalAlpha = 0.38;
  for (let b = 0; b <= bellowCount; b++) {
    const t = b / bellowCount;
    const bx = x + cos * length * t;
    const by = y + sin * length * t;
    const toggle = b % 2 === 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(j(bx + perpCos * bh / 2 * toggle), j(by + perpSin * bh / 2 * toggle));
    ctx.lineTo(j(bx - perpCos * bh / 2 * toggle), j(by - perpSin * bh / 2 * toggle));
    ctx.stroke();
  }

  // End cap at terminal side
  ctx.lineWidth = 1.1;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(j(x + perpCos * bh / 2), j(y + perpSin * bh / 2));
  ctx.lineTo(j(x - perpCos * bh / 2), j(y - perpSin * bh / 2));
  ctx.stroke();

  // Support legs (2) with wheels
  ctx.globalAlpha = 0.42;
  for (let l = 1; l <= 2; l++) {
    const t = l / 3;
    const lx = x + cos * length * t;
    const ly = y + sin * length * t;
    // Vertical leg
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(j(lx), j(ly + bh / 2));
    ctx.lineTo(j(lx + 1), j(ly + bh / 2 + 24));
    ctx.stroke();
    // Wheel
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.arc(j(lx + 1), j(ly + bh / 2 + 27), 4, 0, Math.PI * 2);
    ctx.stroke();
    // Axle
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    ctx.moveTo(j(lx - 5), j(ly + bh / 2 + 27));
    ctx.lineTo(j(lx + 7), j(ly + bh / 2 + 27));
    ctx.stroke();
  }

  // Connection collar at aircraft end (wider box)
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.58;
  ctx.beginPath();
  ctx.rect(j(ex - 9), j(ey - bh / 2), 18, bh);
  ctx.stroke();
  // Collar detail line
  ctx.lineWidth = 0.4;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(j(ex - 9), j(ey));
  ctx.lineTo(j(ex + 9), j(ey));
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}
