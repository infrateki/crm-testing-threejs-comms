import { drawRunway } from '../primitives/runway';
import { drawJetBridge } from '../primitives/jet-bridge';
import { drawCrane } from '../primitives/crane';
import { drawCitySkyline } from '../primitives/city-skyline';

function j(v: number, amt = 1.5): number {
  return v + (Math.random() - 0.5) * amt * 2;
}

function addGrain(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const id = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    id.data[i]     = Math.max(0, Math.min(255, id.data[i]     + n));
    id.data[i + 1] = Math.max(0, Math.min(255, id.data[i + 1] + n));
    id.data[i + 2] = Math.max(0, Math.min(255, id.data[i + 2] + n));
  }
  ctx.putImageData(id, 0, 0);
}

function crossHatch(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bw: number, bh: number,
  spacing: number, alpha: number
): void {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, bw, bh); ctx.clip();
  ctx.strokeStyle = 'rgba(26,26,26,1)';
  ctx.lineWidth = 0.35;
  ctx.globalAlpha = alpha;
  for (let d = -bh; d < bw + bh; d += spacing) {
    ctx.beginPath(); ctx.moveTo(x + d, y); ctx.lineTo(x + d + bh, y + bh); ctx.stroke();
  }
  ctx.restore();
}

// DFW — wide horizontal terminal, 12-bay rhythm, gate piers, control tower
export function drawWideTerminal(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const horizY = h * 0.55;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, horizY);
  sky.addColorStop(0, 'rgba(26,26,26,0.04)');
  sky.addColorStop(1, 'rgba(26,26,26,0.0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizY);

  // Distant city skyline
  drawCitySkyline(ctx, 0, horizY - 18, w);

  ctx.strokeStyle = 'rgba(26,26,26,1)';

  // Cloud wisps
  ctx.lineWidth = 0.45;
  const clouds = [[0.06,0.05],[0.2,0.03],[0.42,0.07],[0.6,0.04],[0.78,0.06],[0.9,0.03]];
  for (const [clx, cly] of clouds) {
    const cwx = clx*w; const cwy = cly*h;
    const cwl = 28 + Math.random()*24;
    ctx.globalAlpha = 0.07 + Math.random()*0.06;
    ctx.beginPath(); ctx.moveTo(j(cwx), j(cwy));
    ctx.bezierCurveTo(j(cwx+cwl*0.3), j(cwy-4), j(cwx+cwl*0.65), j(cwy-3), j(cwx+cwl), j(cwy));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === CONTROL TOWER ===
  const twX = w*0.88; const twBaseY = horizY; const twH = h*0.42;
  ctx.lineWidth = 1.05; ctx.globalAlpha = 0.65;
  ctx.beginPath(); ctx.rect(j(twX-5), j(twBaseY-twH+18), 10, twH-18); ctx.stroke();
  ctx.lineWidth = 0.95;
  ctx.beginPath(); ctx.rect(j(twX-14), j(twBaseY-twH), 28, 18); ctx.stroke();
  ctx.lineWidth = 0.42; ctx.globalAlpha = 0.32;
  for (let tw = 0; tw < 5; tw++) {
    ctx.beginPath(); ctx.rect(j(twX-12+tw*5.2), j(twBaseY-twH+3), 4, 9); ctx.stroke();
  }
  ctx.lineWidth = 0.78; ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.moveTo(j(twX), j(twBaseY-twH)); ctx.lineTo(j(twX+1), j(twBaseY-twH-20)); ctx.stroke();
  ctx.lineWidth = 0.38;
  ctx.beginPath(); ctx.moveTo(j(twX-4), j(twBaseY-twH-12)); ctx.lineTo(j(twX+4), j(twBaseY-twH-12)); ctx.stroke();
  ctx.globalAlpha = 1;

  // === MAIN TERMINAL BODY ===
  const tW = w*0.82; const tH = h*0.2;
  const tX = w*0.05; const tY = horizY - tH;

  ctx.lineWidth = 1.8; ctx.globalAlpha = 0.82;
  ctx.beginPath(); ctx.rect(j(tX), j(tY), tW, tH); ctx.stroke();

  // Flat roof double-line detail
  ctx.lineWidth = 0.78; ctx.globalAlpha = 0.42;
  ctx.beginPath(); ctx.moveTo(j(tX), j(tY+9)); ctx.lineTo(j(tX+tW), j(tY+9)); ctx.stroke();
  ctx.lineWidth = 0.48; ctx.globalAlpha = 0.26;
  ctx.beginPath(); ctx.moveTo(j(tX), j(tY+16)); ctx.lineTo(j(tX+tW), j(tY+16)); ctx.stroke();

  // === 12-BAY RHYTHM ===
  const bayCount = 12;
  const bayW = tW / bayCount;
  ctx.lineWidth = 0.52; ctx.globalAlpha = 0.28;
  for (let b = 1; b < bayCount; b++) {
    const bx = tX + b*bayW;
    ctx.beginPath(); ctx.moveTo(j(bx), j(tY)); ctx.lineTo(j(bx+0.5), j(horizY)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Bay windows (2 rows per bay)
  for (let b = 0; b < bayCount; b++) {
    const bx = tX + b*bayW;
    for (let row = 0; row < 2; row++) {
      const wx = bx + 3; const wy = tY + 6 + row*(tH*0.42);
      const ww = bayW - 6; const wh = tH*0.35;
      ctx.lineWidth = 0.48; ctx.globalAlpha = 0.36;
      ctx.beginPath(); ctx.rect(j(wx), j(wy), ww, wh); ctx.stroke();
      ctx.lineWidth = 0.27; ctx.globalAlpha = 0.16;
      ctx.beginPath(); ctx.moveTo(j(wx+ww/2), j(wy)); ctx.lineTo(j(wx+ww/2+0.5), j(wy+wh)); ctx.stroke();
      ctx.lineWidth = 0.48;
    }
  }
  ctx.globalAlpha = 1;

  // === CANOPY OVERHANG ===
  const canopyH = h*0.065;
  ctx.lineWidth = 1.2; ctx.globalAlpha = 0.62;
  ctx.beginPath(); ctx.moveTo(j(tX-8), j(horizY)); ctx.lineTo(j(tX+tW+8), j(horizY)); ctx.stroke();
  ctx.lineWidth = 0.58; ctx.globalAlpha = 0.32;
  ctx.beginPath(); ctx.moveTo(j(tX-8), j(horizY+canopyH)); ctx.lineTo(j(tX+tW+8), j(horizY+canopyH)); ctx.stroke();
  crossHatch(ctx, tX-8, horizY, tW+16, canopyH, 5, 0.055);
  // Canopy columns (every other bay)
  ctx.lineWidth = 0.62; ctx.globalAlpha = 0.4;
  for (let b = 0; b <= bayCount; b += 2) {
    const bx = tX + b*bayW;
    ctx.beginPath(); ctx.moveTo(j(bx), j(horizY)); ctx.lineTo(j(bx+1), j(horizY+canopyH)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === ROOF EQUIPMENT (HVAC boxes) ===
  const roofEquip = [
    [0.1,28,12],[0.22,18,10],[0.34,24,14],[0.47,22,11],[0.59,28,13],[0.71,16,9]
  ];
  for (const [rx, rw, rh] of roofEquip) {
    const rex = tX + tW*rx;
    ctx.lineWidth = 0.68; ctx.globalAlpha = 0.36;
    ctx.beginPath(); ctx.rect(j(rex), j(tY-rh), rw, rh); ctx.stroke();
    ctx.lineWidth = 0.38;
    ctx.beginPath(); ctx.arc(j(rex+rw/2), j(tY-rh/2), rh/2-1, 0, Math.PI*2); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === GATE PIERS (8) extending below terminal ===
  const pierCount = 8;
  const pierSpacing = tW / (pierCount+1);
  const pierH = h*0.26; const pierW2 = 16;

  for (let p = 0; p < pierCount; p++) {
    const px = tX + pierSpacing*(p+1);
    ctx.lineWidth = 0.98; ctx.globalAlpha = 0.58;
    ctx.beginPath(); ctx.rect(j(px-pierW2/2), j(horizY), pierW2, pierH); ctx.stroke();
    // Pier windows
    ctx.lineWidth = 0.43; ctx.globalAlpha = 0.33;
    ctx.beginPath(); ctx.rect(j(px-5), j(horizY+5), 10, 10); ctx.stroke();
    ctx.beginPath(); ctx.rect(j(px-5), j(horizY+20), 10, 10); ctx.stroke();
    // Jet bridge on alternating piers
    if (p % 2 === 0) {
      drawJetBridge(ctx, px+pierW2/2, horizY+pierH*0.5, 58, 0.18 + p*0.02);
    }
  }
  ctx.globalAlpha = 1;

  // === TAXIWAY MARKINGS ===
  const taxiY = horizY + pierH + 10;
  ctx.lineWidth = 0.78; ctx.setLineDash([14, 9]); ctx.globalAlpha = 0.2;
  ctx.beginPath(); ctx.moveTo(0, j(taxiY)); ctx.lineTo(w, j(taxiY)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 0.48; ctx.globalAlpha = 0.13;
  ctx.beginPath(); ctx.moveTo(0, j(taxiY-12)); ctx.lineTo(w, j(taxiY-12)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, j(taxiY+12)); ctx.lineTo(w, j(taxiY+12)); ctx.stroke();

  // === VEHICLE ROAD ===
  const roadY = h*0.82;
  ctx.lineWidth = 0.88; ctx.globalAlpha = 0.26;
  ctx.beginPath(); ctx.moveTo(0, j(roadY)); ctx.lineTo(w, j(roadY)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, j(roadY+22)); ctx.lineTo(w, j(roadY+22)); ctx.stroke();
  ctx.setLineDash([16, 10]); ctx.lineWidth = 0.48; ctx.globalAlpha = 0.1;
  ctx.beginPath(); ctx.moveTo(0, j(roadY+11)); ctx.lineTo(w, j(roadY+11)); ctx.stroke();
  ctx.setLineDash([]);

  // Service trucks
  const trucks = [w*0.08, w*0.3, w*0.55, w*0.72];
  for (const trx of trucks) {
    ctx.lineWidth = 0.68; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.rect(j(trx), j(roadY+4), 22, 10); ctx.stroke();
    ctx.beginPath(); ctx.rect(j(trx), j(roadY+2), 8, 12); ctx.stroke();
    ctx.lineWidth = 0.42;
    ctx.beginPath(); ctx.arc(j(trx+4), j(roadY+14), 3.5, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(j(trx+17), j(roadY+14), 3.5, 0, Math.PI*2); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Fencing (along taxiway edge)
  const fenceY = horizY + 8;
  ctx.lineWidth = 0.38; ctx.globalAlpha = 0.16;
  ctx.beginPath(); ctx.moveTo(j(tX-5), j(fenceY)); ctx.lineTo(j(tX+tW+5), j(fenceY)); ctx.stroke();
  for (let fp2 = 0; fp2 < 30; fp2++) {
    const fpx = tX + (fp2/29)*(tW+10) - 5;
    ctx.beginPath(); ctx.moveTo(j(fpx), j(fenceY-5)); ctx.lineTo(j(fpx+0.5), j(fenceY+5)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ground line
  ctx.lineWidth = 1.0; ctx.globalAlpha = 0.43;
  ctx.beginPath(); ctx.moveTo(0, j(horizY)); ctx.lineTo(w, j(horizY)); ctx.stroke();
  ctx.globalAlpha = 1;

  drawRunway(ctx, w*0.04, h*0.9, w*0.55);
  drawCrane(ctx, w*0.04, horizY, h*0.42);

  addGrain(ctx, w, h);
}
