import { drawJetBridge } from '../primitives/jet-bridge';
import { drawRunway } from '../primitives/runway';
import { drawPalmTree } from '../primitives/palm-tree';

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

// MCO — cylindrical atrium tower, 10 floor bands, radiating concourses, people mover, runway
export function drawCurvedTower(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const horizY = h * 0.62;
  const cx = w * 0.5;
  const towerTop = h * 0.06;
  const towerW = w * 0.16;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, horizY);
  sky.addColorStop(0, 'rgba(26,26,26,0.04)');
  sky.addColorStop(1, 'rgba(26,26,26,0.0)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizY);

  ctx.strokeStyle = 'rgba(26,26,26,1)';

  // Cloud wisps
  ctx.lineWidth = 0.45;
  const clouds = [[0.07,0.04],[0.22,0.07],[0.42,0.03],[0.65,0.06],[0.82,0.04]];
  for (const [clx, cly] of clouds) {
    const cwx = clx*w; const cwy = cly*h;
    const cwl = 28 + Math.random()*22;
    ctx.globalAlpha = 0.07 + Math.random()*0.06;
    ctx.beginPath(); ctx.moveTo(j(cwx), j(cwy));
    ctx.bezierCurveTo(j(cwx+cwl*0.3), j(cwy-4), j(cwx+cwl*0.65), j(cwy-3), j(cwx+cwl), j(cwy));
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // === CYLINDRICAL TOWER WALLS ===
  // Left curved wall
  ctx.lineWidth = 2.2; ctx.globalAlpha = 0.88;
  ctx.beginPath();
  ctx.moveTo(j(cx - towerW/2), j(horizY));
  ctx.bezierCurveTo(
    j(cx - towerW/2 - 18), j(horizY - (horizY-towerTop)*0.35),
    j(cx - towerW/2 - 6), j(towerTop+18),
    j(cx - 2), j(towerTop)
  );
  ctx.stroke();

  // Right curved wall
  ctx.beginPath();
  ctx.moveTo(j(cx + towerW/2), j(horizY));
  ctx.bezierCurveTo(
    j(cx + towerW/2 + 18), j(horizY - (horizY-towerTop)*0.35),
    j(cx + towerW/2 + 6), j(towerTop+18),
    j(cx + 2), j(towerTop)
  );
  ctx.stroke();

  // === FLOOR BANDS — 10 horizontal ellipses ===
  const floorCount = 10;
  for (let f = 0; f < floorCount; f++) {
    const t = (f + 0.5) / floorCount;
    const fy = towerTop + t*(horizY - towerTop);
    const fw = (towerW * 0.46) * (0.92 + t*0.12);
    const fDepth = fw * 0.22;
    ctx.lineWidth = 0.75; ctx.globalAlpha = 0.33 + t*0.15;
    ctx.beginPath(); ctx.ellipse(j(cx), j(fy), j(fw, 0.5), j(fDepth, 0.3), 0, 0, Math.PI*2); ctx.stroke();
    crossHatch(ctx, cx - fw, fy, fw*2, fDepth+2, 4, 0.038);
    // Curtain wall verticals
    ctx.lineWidth = 0.27; ctx.globalAlpha = 0.1;
    for (let sg = 0; sg < 8; sg++) {
      const sa = (sg/8)*Math.PI*2;
      const sx = cx + Math.cos(sa)*fw;
      const sy = fy + Math.sin(sa)*fDepth;
      if (Math.abs(Math.cos(sa)) < 0.9) {
        ctx.beginPath(); ctx.moveTo(j(sx), j(sy)); ctx.lineTo(j(sx), j(sy + (horizY-towerTop)/floorCount*0.75)); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // === OBSERVATION DECK CAP ===
  ctx.lineWidth = 1.4; ctx.globalAlpha = 0.72;
  ctx.beginPath(); ctx.ellipse(j(cx), j(towerTop+4), j(towerW*0.52, 0.5), j(towerW*0.12, 0.3), 0, 0, Math.PI*2); ctx.stroke();
  ctx.lineWidth = 0.68; ctx.globalAlpha = 0.48;
  ctx.beginPath(); ctx.ellipse(j(cx), j(towerTop-4), j(towerW*0.5, 0.5), j(towerW*0.1, 0.3), 0, 0, Math.PI*2); ctx.stroke();
  // Cab box
  ctx.lineWidth = 0.98; ctx.globalAlpha = 0.62;
  ctx.beginPath(); ctx.rect(j(cx-12), j(towerTop-16), 24, 14); ctx.stroke();
  // Cab windows
  ctx.lineWidth = 0.38; ctx.globalAlpha = 0.28;
  for (let ow = 0; ow < 4; ow++) {
    ctx.beginPath(); ctx.rect(j(cx-10+ow*5.5), j(towerTop-13), 4, 7); ctx.stroke();
  }
  // Antenna
  ctx.lineWidth = 0.82; ctx.globalAlpha = 0.55;
  ctx.beginPath(); ctx.moveTo(j(cx), j(towerTop-16)); ctx.lineTo(j(cx+1), j(towerTop-38)); ctx.stroke();
  ctx.lineWidth = 0.38;
  ctx.beginPath(); ctx.moveTo(j(cx-5), j(towerTop-28)); ctx.lineTo(j(cx+5), j(towerTop-28)); ctx.stroke();
  ctx.globalAlpha = 1;

  // === RADIATING CONCOURSE ARMS ===
  const armH = h*0.14; const armW = w*0.26; const armY = horizY - armH;

  // Left arm
  ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.rect(j(w*0.04), j(armY), armW, armH); ctx.stroke();
  ctx.lineWidth = 0.52; ctx.globalAlpha = 0.33;
  ctx.beginPath(); ctx.moveTo(j(w*0.04), j(armY+8)); ctx.lineTo(j(w*0.04+armW), j(armY+8)); ctx.stroke();
  // Left arm windows
  ctx.lineWidth = 0.43; const leftWins = 6;
  for (let aw = 0; aw < leftWins; aw++) {
    const awx = w*0.06 + aw*(armW-10)/leftWins;
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.rect(j(awx), j(armY+4), (armW/leftWins)-5, armH*0.55); ctx.stroke();
  }

  // Right arm
  ctx.lineWidth = 1.5; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.rect(j(w*0.7), j(armY), armW, armH); ctx.stroke();
  ctx.lineWidth = 0.52; ctx.globalAlpha = 0.33;
  ctx.beginPath(); ctx.moveTo(j(w*0.7), j(armY+8)); ctx.lineTo(j(w*0.7+armW), j(armY+8)); ctx.stroke();
  const rightWins = 6;
  ctx.lineWidth = 0.43;
  for (let aw = 0; aw < rightWins; aw++) {
    const awx = w*0.72 + aw*(armW-10)/rightWins;
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.rect(j(awx), j(armY+4), (armW/rightWins)-5, armH*0.55); ctx.stroke();
  }

  // Forward connector arm
  const fwdW = towerW*0.8; const fwdH = horizY - armY;
  ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.rect(j(cx - fwdW/2), j(armY), fwdW, fwdH); ctx.stroke();
  ctx.globalAlpha = 1;

  // === PEOPLE MOVER TRACK ===
  ctx.setLineDash([8, 5]); ctx.lineWidth = 0.58; ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.moveTo(j(w*0.04+armW), j(horizY-10)); ctx.lineTo(j(cx-towerW/2), j(horizY-10)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(j(cx+towerW/2), j(horizY-10)); ctx.lineTo(j(w*0.7), j(horizY-10)); ctx.stroke();
  ctx.setLineDash([]);
  // Tram vehicle
  ctx.lineWidth = 0.88; ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.rect(j(cx-towerW/2-38), j(horizY-16), 28, 12); ctx.stroke();
  ctx.lineWidth = 0.34;
  ctx.beginPath(); ctx.arc(j(cx-towerW/2-30), j(horizY-4), 4, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(j(cx-towerW/2-18), j(horizY-4), 4, 0, Math.PI*2); ctx.stroke();
  ctx.globalAlpha = 1;

  // === LANDSCAPING (radial garden) ===
  const gardenR = towerW*1.1; const gardenCY = horizY + 8;
  ctx.lineWidth = 0.52; ctx.globalAlpha = 0.26;
  ctx.beginPath(); ctx.ellipse(j(cx), j(gardenCY), gardenR, gardenR*0.28, 0, 0, Math.PI*2); ctx.stroke();
  ctx.lineWidth = 0.28; ctx.globalAlpha = 0.11;
  for (let rp = 0; rp < 12; rp++) {
    const ra = (rp/12)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(j(cx), j(gardenCY));
    ctx.lineTo(j(cx + Math.cos(ra)*gardenR), j(gardenCY + Math.sin(ra)*gardenR*0.28));
    ctx.stroke();
  }

  // Landscaping trees (4 small circles)
  const treePts: [number, number][] = [
    [cx - towerW*1.4, horizY+14], [cx + towerW*1.4, horizY+14],
    [cx - towerW*0.7, horizY+18], [cx + towerW*0.7, horizY+18],
  ];
  ctx.lineWidth = 0.48; ctx.globalAlpha = 0.28;
  for (const [tx, ty] of treePts) {
    ctx.beginPath(); ctx.arc(j(tx), j(ty), 8, 0, Math.PI*2); ctx.stroke();
    crossHatch(ctx, tx-8, ty-8, 16, 16, 4, 0.07);
  }
  ctx.globalAlpha = 1;

  // Jet bridges
  drawJetBridge(ctx, w*0.2, armY + armH*0.5, 65, 0.22);
  drawJetBridge(ctx, w*0.76, armY + armH*0.5, 60, -0.18);

  // Palm trees (Florida)
  drawPalmTree(ctx, w*0.02, h*0.85, 72);
  drawPalmTree(ctx, w*0.97, h*0.88, 66);

  // Ground line
  ctx.lineWidth = 1.0; ctx.globalAlpha = 0.43;
  ctx.beginPath(); ctx.moveTo(0, j(horizY)); ctx.lineTo(w, j(horizY)); ctx.stroke();
  ctx.globalAlpha = 1;

  // Tarmac texture
  ctx.lineWidth = 0.33;
  for (let tm = 1; tm <= 4; tm++) {
    ctx.globalAlpha = 0.045;
    ctx.beginPath(); ctx.moveTo(0, j(horizY+tm*14)); ctx.lineTo(w, j(horizY+tm*14)); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  drawRunway(ctx, w*0.06, h*0.91, w*0.52);

  addGrain(ctx, w, h);
}
