import { drawCrane } from '../primitives/crane';

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
  ctx.lineWidth = 0.3;
  ctx.globalAlpha = alpha;
  for (let d = -bh; d < bw + bh; d += spacing) {
    ctx.beginPath(); ctx.moveTo(x + d, y); ctx.lineTo(x + d + bh, y + bh); ctx.stroke();
  }
  ctx.restore();
}

// Federal / SAM.gov — neoclassical columns, pediment, window grid, stairs, flag poles
export function drawFederalBuilding(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const baseY = h * 0.72;
  const bW = w * 0.62;
  const bX = (w - bW) / 2;
  const bH = h * 0.42;
  const bTop = baseY - bH;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, baseY);
  sky.addColorStop(0, 'rgba(26,26,26,0.035)');
  sky.addColorStop(1, 'rgba(26,26,26,0.0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, baseY);

  ctx.strokeStyle = 'rgba(26,26,26,1)';

  // Background trees (left and right)
  const treeMasses = [
    { x: w*0.04, y: baseY - h*0.28, r: 28 },
    { x: w*0.10, y: baseY - h*0.22, r: 22 },
    { x: w*0.87, y: baseY - h*0.26, r: 26 },
    { x: w*0.93, y: baseY - h*0.20, r: 20 },
  ];
  for (const tm of treeMasses) {
    ctx.lineWidth = 0.95; ctx.globalAlpha = 0.48;
    ctx.beginPath(); ctx.moveTo(j(tm.x), j(baseY)); ctx.lineTo(j(tm.x+1), j(tm.y+tm.r)); ctx.stroke();
    ctx.lineWidth = 0.62; ctx.globalAlpha = 0.38;
    ctx.beginPath(); ctx.ellipse(j(tm.x), j(tm.y), tm.r, tm.r*0.82, 0, 0, Math.PI*2); ctx.stroke();
    crossHatch(ctx, tm.x - tm.r, tm.y - tm.r*0.82, tm.r*2, tm.r*1.64, 5, 0.07);
    ctx.lineWidth = 0.38; ctx.globalAlpha = 0.22;
    for (let tb = 0; tb < 8; tb++) {
      const ta = (tb/8)*Math.PI*2;
      const tbr = tm.r*(0.85 + Math.random()*0.2);
      ctx.beginPath();
      ctx.moveTo(j(tm.x + Math.cos(ta)*tbr*0.7), j(tm.y + Math.sin(ta)*tbr*0.6));
      ctx.lineTo(j(tm.x + Math.cos(ta)*tbr), j(tm.y + Math.sin(ta)*tbr*0.9));
      ctx.stroke();
    }
  }

  // Clouds
  ctx.lineWidth = 0.45;
  for (let ci = 0; ci < 5; ci++) {
    const cwx = w*(0.06 + ci*0.19 + Math.random()*0.04);
    const cwy = h*(0.04 + Math.random()*0.08);
    const cwl = 26 + Math.random()*22;
    ctx.globalAlpha = 0.055 + Math.random()*0.05;
    ctx.beginPath(); ctx.moveTo(j(cwx), j(cwy));
    ctx.bezierCurveTo(j(cwx+cwl*0.3), j(cwy-4), j(cwx+cwl*0.7), j(cwy-3), j(cwx+cwl), j(cwy));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === CORNICE / ENTABLATURE ===
  const corniceY = bTop + 4; const corniceH = 14;
  ctx.lineWidth = 1.6; ctx.globalAlpha = 0.82;
  ctx.beginPath(); ctx.rect(j(bX - 8), j(corniceY), bW + 16, corniceH); ctx.stroke();
  ctx.lineWidth = 0.48; ctx.globalAlpha = 0.38;
  for (let cn = 1; cn <= 3; cn++) {
    ctx.beginPath(); ctx.moveTo(j(bX-6), j(corniceY + cn*(corniceH/4))); ctx.lineTo(j(bX+bW+6), j(corniceY + cn*(corniceH/4))); ctx.stroke();
  }
  crossHatch(ctx, bX-8, corniceY+corniceH, bW+16, 8, 4, 0.07);

  // === PEDIMENT ===
  const pedBase = corniceY; const pedPeakY = pedBase - h*0.1;
  ctx.lineWidth = 2.0; ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(j(bX - 12), j(pedBase));
  ctx.lineTo(j(bX + bW*0.5), j(pedPeakY));
  ctx.lineTo(j(bX + bW + 12), j(pedBase));
  ctx.stroke();
  ctx.lineWidth = 1.35; ctx.globalAlpha = 0.72;
  ctx.beginPath(); ctx.moveTo(j(bX-12), j(pedBase+1)); ctx.lineTo(j(bX+bW+12), j(pedBase+1)); ctx.stroke();
  // Tympanum inner outline
  ctx.lineWidth = 0.58; ctx.globalAlpha = 0.32;
  ctx.beginPath();
  ctx.moveTo(j(bX+8), j(pedBase-2)); ctx.lineTo(j(bX+bW*0.5), j(pedPeakY+8)); ctx.lineTo(j(bX+bW-8), j(pedBase-2));
  ctx.stroke();
  // Tympanum motif — vertical strokes
  ctx.lineWidth = 0.38; ctx.globalAlpha = 0.18;
  for (let pm = 0; pm < 5; pm++) {
    const pmx = bX + bW*(0.24 + pm*0.13);
    ctx.beginPath(); ctx.moveTo(j(pmx), j(pedBase-3));
    ctx.lineTo(j(pmx), j(pedBase - 5 - (pedBase - pedPeakY)*(0.15 + Math.abs(pm-2)*0.05)));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === MAIN FACADE ===
  ctx.lineWidth = 1.4; ctx.globalAlpha = 0.78;
  ctx.beginPath(); ctx.rect(j(bX), j(bTop), bW, bH - (bTop - corniceY)); ctx.stroke();

  // === COLUMNS — 8 with fluting ===
  const colCount = 8;
  const colSpacing = bW / (colCount + 1);
  const colW2 = 11;
  const colH = bH * 0.85;

  for (let i = 0; i < colCount; i++) {
    const cx = bX + colSpacing * (i + 1);
    const colTopY = bTop + bH - colH;

    // Column shaft edges
    ctx.lineWidth = 1.05; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.moveTo(j(cx - colW2/2), j(baseY)); ctx.lineTo(j(cx - colW2/2+1), j(colTopY)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(j(cx + colW2/2), j(baseY)); ctx.lineTo(j(cx + colW2/2+1), j(colTopY)); ctx.stroke();

    // Fluting (5 lines per column)
    ctx.lineWidth = 0.27; ctx.globalAlpha = 0.2;
    for (let f = 1; f <= 5; f++) {
      const fx = cx - colW2/2 + (f/6)*colW2;
      ctx.beginPath(); ctx.moveTo(j(fx), j(baseY-3)); ctx.lineTo(j(fx+0.5), j(colTopY+2)); ctx.stroke();
    }

    // Column base (double line)
    ctx.lineWidth = 0.78; ctx.globalAlpha = 0.52;
    ctx.beginPath(); ctx.moveTo(j(cx-colW2/2-2), j(baseY)); ctx.lineTo(j(cx+colW2/2+2), j(baseY)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(j(cx-colW2/2-1), j(baseY-5)); ctx.lineTo(j(cx+colW2/2+1), j(baseY-5)); ctx.stroke();

    // Capital (wide bar + volutes)
    ctx.lineWidth = 0.88; ctx.globalAlpha = 0.52;
    ctx.beginPath(); ctx.moveTo(j(cx-colW2/2-3), j(colTopY+3)); ctx.lineTo(j(cx+colW2/2+3), j(colTopY+3)); ctx.stroke();
    ctx.lineWidth = 0.48; ctx.globalAlpha = 0.32;
    ctx.beginPath(); ctx.moveTo(j(cx-colW2/2-2), j(colTopY+7)); ctx.lineTo(j(cx+colW2/2+2), j(colTopY+7)); ctx.stroke();
    ctx.lineWidth = 0.38; ctx.globalAlpha = 0.22;
    ctx.beginPath(); ctx.arc(j(cx-colW2/2+1), j(colTopY+5), 3, -Math.PI*0.8, Math.PI*0.2); ctx.stroke();
    ctx.beginPath(); ctx.arc(j(cx+colW2/2-1), j(colTopY+5), 3, Math.PI*0.8, Math.PI*2-0.2); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === WINDOW GRID — 3 floors × 8 windows ===
  const floors = 3; const winsPerFloor = 8;
  const winAreaL = bX + 8; const winAreaR = bX + bW - 8;
  const winAreaTop = corniceY + corniceH + 6; const winAreaH = bH * 0.55;
  const winW2 = (winAreaR - winAreaL)/winsPerFloor - 4;
  const winH2 = winAreaH/floors - 8;
  const winColSp = (winAreaR - winAreaL)/winsPerFloor;
  const winRowSp = winAreaH/floors;

  for (let fl = 0; fl < floors; fl++) {
    for (let wi = 0; wi < winsPerFloor; wi++) {
      const wx = winAreaL + wi*winColSp + 2;
      const wy = winAreaTop + fl*winRowSp + 4;
      ctx.lineWidth = 0.78; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.rect(j(wx), j(wy), winW2, winH2); ctx.stroke();
      // Sill
      ctx.lineWidth = 0.38; ctx.globalAlpha = 0.32;
      ctx.beginPath(); ctx.moveTo(j(wx-1), j(wy+winH2+1)); ctx.lineTo(j(wx+winW2+1), j(wy+winH2+1)); ctx.stroke();
      // Pane divider
      ctx.lineWidth = 0.28; ctx.globalAlpha = 0.22;
      ctx.beginPath(); ctx.moveTo(j(wx+winW2/2), j(wy)); ctx.lineTo(j(wx+winW2/2+0.5), j(wy+winH2)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(j(wx), j(wy+winH2*0.55)); ctx.lineTo(j(wx+winW2), j(wy+winH2*0.55)); ctx.stroke();
      // Shadow in top portion
      if (Math.random() > 0.55) crossHatch(ctx, wx+1, wy+1, winW2-2, winH2*0.42, 4, 0.05);
    }
  }
  ctx.globalAlpha = 1;

  // === STEPS ===
  const stepCount = 6; const stepH2 = 7;
  const stepWBase = bW + 24;
  for (let s = 0; s < stepCount; s++) {
    const sy = baseY + s*stepH2;
    const sw = stepWBase + s*16;
    const sx = (w - sw)/2;
    ctx.lineWidth = 0.88; ctx.globalAlpha = 0.52 - s*0.04;
    ctx.beginPath(); ctx.moveTo(j(sx), j(sy)); ctx.lineTo(j(sx+sw), j(sy)); ctx.stroke();
    crossHatch(ctx, sx, sy, sw, stepH2, 5, 0.038);
  }
  ctx.globalAlpha = 1;

  // === FLAG POLES ===
  const poleData = [
    { x: bX - 22 },
    { x: bX + bW + 22 },
  ];
  for (const fp of poleData) {
    const fpH = h * 0.46;
    ctx.lineWidth = 0.82; ctx.globalAlpha = 0.62;
    ctx.beginPath(); ctx.moveTo(j(fp.x), j(baseY)); ctx.lineTo(j(fp.x+1), j(baseY-fpH)); ctx.stroke();
    ctx.lineWidth = 0.58;
    ctx.beginPath(); ctx.arc(j(fp.x+1), j(baseY-fpH), 3, 0, Math.PI*2); ctx.stroke();
    // Flag
    ctx.lineWidth = 0.48; ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(j(fp.x+1), j(baseY-fpH+4));
    ctx.bezierCurveTo(j(fp.x+14), j(baseY-fpH+2), j(fp.x+24), j(baseY-fpH+8), j(fp.x+22), j(baseY-fpH+16));
    ctx.bezierCurveTo(j(fp.x+14), j(baseY-fpH+14), j(fp.x+8), j(baseY-fpH+18), j(fp.x+1), j(baseY-fpH+16));
    ctx.stroke();
    ctx.lineWidth = 0.28; ctx.globalAlpha = 0.18;
    for (let fs = 1; fs <= 4; fs++) {
      ctx.beginPath(); ctx.moveTo(j(fp.x+2), j(baseY-fpH+5+fs*2.5)); ctx.lineTo(j(fp.x+20), j(baseY-fpH+5+fs*2.5+1)); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // === HEDGES ===
  const hedges = [
    { x: bX-52, y: baseY+stepCount*stepH2, w2: 38, h2: 20 },
    { x: bX+bW+14, y: baseY+stepCount*stepH2, w2: 38, h2: 20 },
    { x: w*0.02, y: baseY+stepCount*stepH2, w2: w*0.1, h2: 18 },
    { x: w*0.88, y: baseY+stepCount*stepH2, w2: w*0.1, h2: 18 },
  ];
  for (const hg of hedges) {
    ctx.lineWidth = 0.68; ctx.globalAlpha = 0.42;
    ctx.beginPath(); ctx.rect(j(hg.x), j(hg.y), hg.w2, hg.h2); ctx.stroke();
    crossHatch(ctx, hg.x, hg.y, hg.w2, hg.h2, 4, 0.08);
    ctx.lineWidth = 0.48; ctx.globalAlpha = 0.32;
    for (let hb = 0; hb < Math.floor(hg.w2/8); hb++) {
      ctx.beginPath(); ctx.arc(j(hg.x+4+hb*8), j(hg.y-1), 4+Math.random()*2, Math.PI, 0); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Walkway / path
  const pthW = 44; const pthX = w/2 - pthW/2;
  const pthTop = baseY + stepCount*stepH2;
  ctx.lineWidth = 0.55; ctx.globalAlpha = 0.18;
  ctx.beginPath(); ctx.moveTo(j(pthX), j(pthTop)); ctx.lineTo(j(pthX), h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(j(pthX+pthW), j(pthTop)); ctx.lineTo(j(pthX+pthW), h); ctx.stroke();
  ctx.lineWidth = 0.32; ctx.globalAlpha = 0.1;
  for (let pp = 0; pp < 8; pp++) {
    ctx.beginPath(); ctx.moveTo(j(pthX), j(pthTop+pp*14)); ctx.lineTo(j(pthX+pthW), j(pthTop+pp*14)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Ground line
  const groundY = baseY + stepCount*stepH2;
  ctx.lineWidth = 1.0; ctx.globalAlpha = 0.42;
  ctx.beginPath(); ctx.moveTo(0, j(groundY)); ctx.lineTo(w, j(groundY)); ctx.stroke();
  ctx.lineWidth = 0.48; ctx.globalAlpha = 0.18;
  ctx.beginPath(); ctx.moveTo(0, j(groundY+24)); ctx.lineTo(w, j(groundY+24)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, j(groundY+40)); ctx.lineTo(w, j(groundY+40)); ctx.stroke();
  ctx.globalAlpha = 1;

  // Cranes
  drawCrane(ctx, w*0.09, baseY, h*0.52);
  drawCrane(ctx, w*0.84, baseY, h*0.46);

  addGrain(ctx, w, h);
}
