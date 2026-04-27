import { drawCitySkyline } from '../primitives/city-skyline';
import { drawJetBridge } from '../primitives/jet-bridge';

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
  ctx.lineWidth = 0.32;
  ctx.globalAlpha = alpha;
  for (let d = -bh; d < bw + bh; d += spacing) {
    ctx.beginPath(); ctx.moveTo(x + d, y); ctx.lineTo(x + d + bh, y + bh); ctx.stroke();
  }
  ctx.restore();
}

// LGA — sharp angular terminal, steel structure, city skyline, East River
export function drawModernAngular(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const horizY = h * 0.58;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, horizY);
  sky.addColorStop(0, 'rgba(26,26,26,0.05)');
  sky.addColorStop(1, 'rgba(26,26,26,0.0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizY);

  // City skyline
  drawCitySkyline(ctx, 0, horizY - 14, w);

  ctx.strokeStyle = 'rgba(26,26,26,1)';

  // === WATER / EAST RIVER ===
  for (let row = 0; row < 6; row++) {
    ctx.lineWidth = 0.38 + row*0.06;
    ctx.globalAlpha = 0.065 + row*0.022;
    const wy = horizY + 6 + row*8;
    ctx.beginPath(); ctx.moveTo(0, j(wy, 1));
    for (let x = 0; x < w; x += 28) {
      ctx.quadraticCurveTo(j(x+14), j(wy-3), j(x+28), j(wy));
    }
    ctx.stroke();
  }
  // Water sparkles
  ctx.lineWidth = 0.28; ctx.globalAlpha = 0.07;
  for (let sp = 0; sp < 18; sp++) {
    const spx = w*0.05 + (sp/17)*w*0.9;
    const spy = horizY + 6 + Math.random()*36;
    ctx.beginPath(); ctx.moveTo(j(spx-3), j(spy)); ctx.lineTo(j(spx+3), j(spy)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(j(spx), j(spy-2)); ctx.lineTo(j(spx), j(spy+2)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === ANGULAR TERMINAL — faceted roof polygon ===
  const tY = horizY - h*0.28;
  const pts: [number, number][] = [
    [w*0.10, horizY],
    [w*0.06, tY+18],
    [w*0.14, tY+4],
    [w*0.28, tY-10],
    [w*0.42, tY+2],
    [w*0.62, tY-6],
    [w*0.74, tY+8],
    [w*0.84, tY+16],
    [w*0.90, horizY],
  ];

  // Terminal outline
  ctx.lineWidth = 2.2; ctx.globalAlpha = 0.88;
  ctx.beginPath(); ctx.moveTo(j(pts[0][0]), j(pts[0][1]));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(j(pts[i][0]), j(pts[i][1]));
  ctx.stroke();

  // Bottom edge
  ctx.lineWidth = 1.8; ctx.globalAlpha = 0.8;
  ctx.beginPath(); ctx.moveTo(j(pts[0][0]), j(pts[0][1])); ctx.lineTo(j(pts[pts.length-1][0]), j(pts[pts.length-1][1])); ctx.stroke();

  // === GLASS PANEL FACETS ===
  for (let seg = 0; seg < pts.length-1; seg++) {
    const p1 = pts[seg]; const p2 = pts[seg+1];
    const segW = p2[0] - p1[0];
    const panelCount = Math.max(2, Math.floor(Math.abs(segW)/18));

    for (let pan = 0; pan < panelCount; pan++) {
      const t1 = pan/panelCount; const t2 = (pan+1)/panelCount;
      const px1 = p1[0] + t1*segW; const py1 = p1[1] + t1*(p2[1]-p1[1]);
      const px2 = p1[0] + t2*segW;

      // Vertical panel divider
      ctx.lineWidth = 0.45; ctx.globalAlpha = 0.2;
      ctx.beginPath(); ctx.moveTo(j(px1), j(py1)); ctx.lineTo(j(px1), j(horizY)); ctx.stroke();

      // Diagonal reflection
      if (Math.random() > 0.52) {
        const py2 = p1[1] + t2*(p2[1]-p1[1]);
        ctx.lineWidth = 0.27; ctx.globalAlpha = 0.07;
        ctx.beginPath(); ctx.moveTo(j(px1+2), j(py1+5)); ctx.lineTo(j(px2-2), j(py2 + (horizY-py2)*0.4)); ctx.stroke();
      }

      // Horizontal floor lines in panel
      const hLines = Math.max(2, Math.floor((horizY-py1)/16));
      ctx.lineWidth = 0.28; ctx.globalAlpha = 0.13;
      for (let hl = 1; hl < hLines; hl++) {
        const hly = py1 + hl*(horizY-py1)/hLines;
        const px2a = p1[0] + t2*segW;
        ctx.beginPath(); ctx.moveTo(j(px1), j(hly)); ctx.lineTo(j(px2a), j(hly)); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // === EXPOSED STEEL COLUMNS at facet junctions ===
  const structPts = [pts[0], pts[2], pts[3], pts[4], pts[5], pts[6], pts[8]];
  ctx.lineWidth = 1.1; ctx.globalAlpha = 0.6;
  for (const sp of structPts) {
    ctx.beginPath(); ctx.moveTo(j(sp[0]+2), j(sp[1])); ctx.lineTo(j(sp[0]+3), j(horizY)); ctx.stroke();
    ctx.lineWidth = 0.38; ctx.globalAlpha = 0.26;
    ctx.beginPath(); ctx.moveTo(j(sp[0]-3), j(sp[1]+5)); ctx.lineTo(j(sp[0]+7), j(sp[1]+5)); ctx.stroke();
    ctx.lineWidth = 1.1; ctx.globalAlpha = 0.6;
  }

  // Diagonal cross-bracing on panels
  ctx.lineWidth = 0.52; ctx.globalAlpha = 0.22;
  for (let br = 0; br < pts.length-2; br++) {
    const p1 = pts[br]; const p2 = pts[br+2];
    if (Math.random() > 0.38) {
      ctx.beginPath(); ctx.moveTo(j(p1[0]+5), j(p1[1])); ctx.lineTo(j(p2[0]-5), j(horizY)); ctx.stroke();
    }
    if (Math.random() > 0.45) {
      ctx.beginPath(); ctx.moveTo(j(p2[0]-5), j(p2[1])); ctx.lineTo(j(p1[0]+5), j(horizY)); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Shadow hatching under roof jags
  crossHatch(ctx, pts[3][0]-10, pts[3][1], 62, 18, 5, 0.065);
  crossHatch(ctx, pts[5][0]-10, pts[5][1], 52, 15, 4.5, 0.055);

  // === APPROACH ROAD (curving from right) ===
  ctx.lineWidth = 1.0; ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(w, h*0.78);
  ctx.bezierCurveTo(j(w*0.82), j(h*0.74), j(w*0.65), j(h*0.72), j(w*0.5), j(h*0.76));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w, h*0.86);
  ctx.bezierCurveTo(j(w*0.80), j(h*0.82), j(w*0.64), j(h*0.80), j(w*0.5), j(h*0.84));
  ctx.stroke();
  ctx.setLineDash([10, 7]); ctx.lineWidth = 0.48; ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(w, h*0.82);
  ctx.bezierCurveTo(j(w*0.81), j(h*0.78), j(w*0.65), j(h*0.76), j(w*0.5), j(h*0.80));
  ctx.stroke();
  ctx.setLineDash([]);

  // Road vehicles
  ctx.lineWidth = 0.68; ctx.globalAlpha = 0.28;
  for (let rv = 0; rv < 4; rv++) {
    const rvx = w*(0.55 + rv*0.09);
    const rvy = h*(0.77 + rv*0.011);
    ctx.beginPath(); ctx.rect(j(rvx), j(rvy), 20, 9); ctx.stroke();
    ctx.lineWidth = 0.38;
    ctx.beginPath(); ctx.arc(j(rvx+4), j(rvy+9), 3, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(j(rvx+16), j(rvy+9), 3, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 0.68;
  }
  ctx.globalAlpha = 1;

  // Jet bridges (3)
  drawJetBridge(ctx, w*0.22, horizY, 78, 0.15);
  drawJetBridge(ctx, w*0.44, horizY, 72, 0.2);
  drawJetBridge(ctx, w*0.64, horizY, 68, 0.12);

  // Ground line
  ctx.lineWidth = 1.1; ctx.globalAlpha = 0.43;
  ctx.beginPath(); ctx.moveTo(0, j(horizY)); ctx.lineTo(w, j(horizY)); ctx.stroke();
  ctx.globalAlpha = 1;

  // Tarmac texture
  ctx.lineWidth = 0.33;
  for (let t = 1; t <= 5; t++) {
    ctx.globalAlpha = 0.045;
    ctx.beginPath(); ctx.moveTo(0, j(horizY+t*15)); ctx.lineTo(w, j(horizY+t*15+(Math.random()-0.5)*3)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  addGrain(ctx, w, h);
}
