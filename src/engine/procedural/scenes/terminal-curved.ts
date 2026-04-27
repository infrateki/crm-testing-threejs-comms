import { drawPalmTree } from '../primitives/palm-tree';
import { drawJetBridge } from '../primitives/jet-bridge';
import { drawRunway } from '../primitives/runway';

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

// MIA South Terminal — sweeping curved roof, curtain wall, palm trees, jet bridges
export function drawTerminalCurved(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const horizY = h * 0.62;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, horizY);
  sky.addColorStop(0, 'rgba(26,26,26,0.045)');
  sky.addColorStop(1, 'rgba(26,26,26,0.0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizY);

  ctx.strokeStyle = 'rgba(26,26,26,1)';

  // Cloud wisps
  const cloudPos = [[0.08,0.06],[0.22,0.04],[0.38,0.08],[0.52,0.03],[0.65,0.07],[0.78,0.04],[0.9,0.09]];
  for (const [cx, cy] of cloudPos) {
    const wx = cx * w; const wy = cy * h;
    const wl = 32 + Math.random() * 28;
    ctx.lineWidth = 0.48; ctx.globalAlpha = 0.07 + Math.random() * 0.07;
    ctx.beginPath(); ctx.moveTo(j(wx), j(wy));
    ctx.bezierCurveTo(j(wx + wl * 0.3), j(wy - 5), j(wx + wl * 0.7), j(wy - 4), j(wx + wl), j(wy));
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(j(wx + 5), j(wy + 3));
    ctx.bezierCurveTo(j(wx + wl * 0.3), j(wy - 1), j(wx + wl * 0.65), j(wy), j(wx + wl - 5), j(wy + 3));
    ctx.stroke();
  }

  // Distant city silhouette (very faint)
  ctx.lineWidth = 0.7; ctx.globalAlpha = 0.055;
  const distR = [0.02,0.07,0.13,0.18,0.24,0.3,0.35,0.41,0.47,0.53,0.58,0.63,0.69,0.74,0.79,0.85,0.9,0.95];
  for (const r of distR) {
    const bh = 14 + Math.random() * 38;
    ctx.beginPath(); ctx.rect(j(r * w), j(horizY - bh - 12), 8 + Math.random() * 16, bh); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Control tower (right side)
  const twX = w * 0.85; const twBaseY = horizY; const twH = h * 0.38;
  ctx.lineWidth = 1.0; ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.rect(j(twX - 5), j(twBaseY - twH + 18), 10, twH * 0.8); ctx.stroke();
  ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.rect(j(twX - 12), j(twBaseY - twH), 24, 18); ctx.stroke();
  ctx.lineWidth = 0.38; ctx.globalAlpha = 0.3;
  for (let tw = 0; tw < 4; tw++) {
    ctx.beginPath(); ctx.rect(j(twX - 10 + tw * 6), j(twBaseY - twH + 3), 4, 8); ctx.stroke();
  }
  ctx.lineWidth = 0.72; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(j(twX), j(twBaseY - twH)); ctx.lineTo(j(twX+1), j(twBaseY - twH - 22)); ctx.stroke();
  ctx.lineWidth = 0.38;
  ctx.beginPath(); ctx.moveTo(j(twX - 5), j(twBaseY - twH - 14)); ctx.lineTo(j(twX + 5), j(twBaseY - twH - 14)); ctx.stroke();
  ctx.globalAlpha = 1;

  // === CURVED ROOF ===
  ctx.lineWidth = 2.2; ctx.globalAlpha = 0.88;
  ctx.beginPath();
  ctx.moveTo(j(w * 0.04), j(horizY - 26));
  ctx.bezierCurveTo(j(w * 0.18), j(horizY - h * 0.3), j(w * 0.52), j(horizY - h * 0.34), j(w * 0.93), j(horizY - 20));
  ctx.stroke();

  // Roof inner ceiling line
  ctx.lineWidth = 1.1; ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(j(w * 0.06), j(horizY - 16));
  ctx.bezierCurveTo(j(w * 0.2), j(horizY - h * 0.24), j(w * 0.52), j(horizY - h * 0.27), j(w * 0.91), j(horizY - 13));
  ctx.stroke();

  // Structural ribs — 20 across roof
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const rx = w * 0.04 + t * (w * 0.89);
    // Approximate bezier Y at t
    const b0y = horizY - 26; const b3y = horizY - 20;
    const roofY = (1-t)*(1-t)*(1-t)*b0y + 3*(1-t)*(1-t)*t*(horizY - h*0.3) + 3*(1-t)*t*t*(horizY - h*0.34) + t*t*t*b3y;
    ctx.globalAlpha = 0.22 + t * (1 - t) * 0.4;
    ctx.beginPath(); ctx.moveTo(j(rx), j(roofY)); ctx.lineTo(j(rx + 2), j(horizY - 12)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === GLASS CURTAIN WALL ===
  const fL = w * 0.06; const fR = w * 0.91;
  const fTopY = horizY - h * 0.22; const fH = h * 0.22;
  const cols = 17; const rows = 6;
  const colW = (fR - fL) / cols; const rowH = fH / rows;

  crossHatch(ctx, fL, fTopY, fR - fL, fH, 6, 0.038);

  // Vertical mullions
  ctx.lineWidth = 0.52; ctx.globalAlpha = 0.35;
  for (let c = 0; c <= cols; c++) {
    const mx = fL + c * colW;
    ctx.beginPath(); ctx.moveTo(j(mx), j(fTopY)); ctx.lineTo(j(mx+1), j(fTopY+fH)); ctx.stroke();
  }
  // Horizontal mullions
  for (let r = 0; r <= rows; r++) {
    const my = fTopY + r * rowH;
    ctx.beginPath(); ctx.moveTo(j(fL), j(my)); ctx.lineTo(j(fR), j(my)); ctx.stroke();
  }

  // Pane reflections
  ctx.lineWidth = 0.28;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() > 0.65) {
        const px = fL + c * colW + 2; const py = fTopY + r * rowH + 2;
        ctx.globalAlpha = 0.05 + Math.random() * 0.07;
        ctx.beginPath(); ctx.moveTo(j(px), j(py + rowH * 0.25)); ctx.lineTo(j(px + colW * 0.42), j(py + 1)); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // Lobby entrance (center)
  const lobW = w * 0.18; const lobX = w * 0.5 - lobW / 2;
  const lobH = h * 0.12; const lobY = horizY - lobH;
  ctx.lineWidth = 1.3; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.rect(j(lobX), j(lobY), lobW, lobH); ctx.stroke();
  // Doors (4 panels)
  ctx.lineWidth = 0.52; ctx.globalAlpha = 0.4;
  const dW = lobW / 4;
  for (let d = 0; d < 4; d++) {
    ctx.beginPath(); ctx.rect(j(lobX + d*dW + 2), j(lobY + 3), dW - 4, lobH - 4); ctx.stroke();
  }
  // Canopy over lobby
  ctx.lineWidth = 1.0; ctx.globalAlpha = 0.62;
  ctx.beginPath(); ctx.moveTo(j(lobX - 14), j(lobY - 8)); ctx.lineTo(j(lobX + lobW + 14), j(lobY - 8)); ctx.stroke();
  ctx.lineWidth = 0.55; ctx.globalAlpha = 0.38;
  for (let cs = 0; cs < 6; cs++) {
    const csx = lobX - 12 + cs * (lobW + 26) / 5;
    ctx.beginPath(); ctx.moveTo(j(csx), j(lobY - 8)); ctx.lineTo(j(csx+2), j(lobY)); ctx.stroke();
  }
  crossHatch(ctx, lobX - 14, lobY - 8, lobW + 28, 10, 5, 0.07);
  ctx.globalAlpha = 1;

  // === TARMAC ===
  ctx.lineWidth = 1.1; ctx.globalAlpha = 0.48;
  ctx.beginPath(); ctx.moveTo(j(0), j(horizY)); ctx.lineTo(j(w), j(horizY)); ctx.stroke();

  ctx.lineWidth = 0.38;
  for (let i = 1; i <= 7; i++) {
    ctx.globalAlpha = 0.05 + i * 0.008;
    ctx.beginPath(); ctx.moveTo(0, j(horizY + i*13)); ctx.lineTo(w, j(horizY + i*13 + (Math.random()-0.5)*3)); ctx.stroke();
  }
  // Expansion joint texture
  ctx.lineWidth = 0.28; ctx.globalAlpha = 0.042;
  for (let tx = -20; tx < w + 40; tx += 30) {
    ctx.beginPath(); ctx.moveTo(j(tx), horizY + 2); ctx.lineTo(j(tx + 14), h); ctx.stroke();
  }
  // Taxiway centerline dashes
  ctx.lineWidth = 0.75; ctx.setLineDash([12, 8]); ctx.globalAlpha = 0.18;
  ctx.beginPath(); ctx.moveTo(0, j(horizY + 32)); ctx.lineTo(w, j(horizY + 32)); ctx.stroke();
  ctx.setLineDash([]);
  // Road double white
  ctx.lineWidth = 0.55; ctx.globalAlpha = 0.13;
  ctx.beginPath(); ctx.moveTo(0, j(horizY+56)); ctx.lineTo(w, j(horizY+56)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, j(horizY+62)); ctx.lineTo(w, j(horizY+62)); ctx.stroke();
  ctx.globalAlpha = 1;

  // Service vehicles (4)
  const vBase = horizY + 20;
  const vData: [number, number, number][] = [[w*0.12,24,10],[w*0.42,18,8],[w*0.65,28,11],[w*0.78,16,9]];
  for (const [vx, vl, vh] of vData) {
    ctx.lineWidth = 0.68; ctx.globalAlpha = 0.34;
    ctx.beginPath(); ctx.rect(j(vx), j(vBase), vl, vh); ctx.stroke();
    ctx.lineWidth = 0.38;
    ctx.beginPath(); ctx.arc(j(vx+5), j(vBase+vh), 3.5, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(j(vx+vl-5), j(vBase+vh), 3.5, 0, Math.PI*2); ctx.stroke();
    ctx.lineWidth = 0.55;
    ctx.beginPath(); ctx.rect(j(vx), j(vBase-5), vl*0.34, vh+4); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Aircraft silhouette (left, parked)
  const acX = w * 0.16; const acY = horizY - 5;
  ctx.lineWidth = 0.85; ctx.globalAlpha = 0.27;
  ctx.beginPath();
  ctx.moveTo(j(acX), j(acY));
  ctx.bezierCurveTo(j(acX+20), j(acY-8), j(acX+58), j(acY-8), j(acX+78), j(acY));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(j(acX+26), j(acY-4)); ctx.lineTo(j(acX+10), j(acY+12));
  ctx.lineTo(j(acX+50), j(acY+12)); ctx.lineTo(j(acX+52), j(acY-3));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(j(acX+66), j(acY-3)); ctx.lineTo(j(acX+68), j(acY-20));
  ctx.lineTo(j(acX+78), j(acY-16));
  ctx.stroke();
  ctx.lineWidth = 0.48;
  ctx.beginPath(); ctx.ellipse(j(acX+19), j(acY+11), 7, 4, 0, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(j(acX+41), j(acY+11), 6, 3.5, 0, 0, Math.PI*2); ctx.stroke();
  ctx.globalAlpha = 1;

  // Jet bridges (3)
  drawJetBridge(ctx, w*0.28, horizY, 88, 0.28);
  drawJetBridge(ctx, w*0.48, horizY, 82, 0.32);
  drawJetBridge(ctx, w*0.68, horizY, 74, 0.25);

  // Palm trees (4)
  drawPalmTree(ctx, w*0.04, h*0.86, 95);
  drawPalmTree(ctx, w*0.89, h*0.88, 80);
  drawPalmTree(ctx, w*0.95, h*0.82, 65);
  drawPalmTree(ctx, w*0.01, h*0.9, 55);

  // Windsock
  const wsX = w * 0.75; const wsBaseY = horizY;
  ctx.lineWidth = 0.68; ctx.globalAlpha = 0.48;
  ctx.beginPath(); ctx.moveTo(j(wsX), j(wsBaseY)); ctx.lineTo(j(wsX+1), j(wsBaseY-28)); ctx.stroke();
  ctx.lineWidth = 0.48;
  ctx.beginPath();
  ctx.moveTo(j(wsX), j(wsBaseY-28));
  ctx.bezierCurveTo(j(wsX+5), j(wsBaseY-30), j(wsX+20), j(wsBaseY-26), j(wsX+22), j(wsBaseY-22));
  ctx.bezierCurveTo(j(wsX+20), j(wsBaseY-20), j(wsX+5), j(wsBaseY-24), j(wsX), j(wsBaseY-22));
  ctx.stroke();
  ctx.lineWidth = 0.28; ctx.globalAlpha = 0.28;
  for (let wb = 1; wb <= 3; wb++) {
    ctx.beginPath(); ctx.moveTo(j(wsX + wb*5), j(wsBaseY-29+wb)); ctx.lineTo(j(wsX+wb*5), j(wsBaseY-22+wb)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Runway
  drawRunway(ctx, w*0.08, h*0.9, w*0.52);

  addGrain(ctx, w, h);
}
