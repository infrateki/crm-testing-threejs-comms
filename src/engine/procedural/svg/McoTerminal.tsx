/* MCO — Orlando: cylindrical curved tower terminal with tropical landscape */
import {
  line, rect, path, circle, hatch, palmTree, bird, cumulus, cloud,
  group, svgDocument, seedRandom,
} from './helpers';

export interface SceneOpts {
  width?: number;
  height?: number;
  seed?: number;
}

export function generateMcoTerminal({ width = 1600, height = 900, seed = 5151 }: SceneOpts = {}): string {
  const W = width, H = height;
  const horizon = H * 0.66;
  const rng = seedRandom(seed);

  // ╭──────────────────────────────────────────────────╮
  // │ BACKGROUND — Florida flat horizon, sunset sky, theme park
  // ╰──────────────────────────────────────────────────╯
  const bg: string[] = [];

  bg.push(line(0, horizon, W, horizon, { width: 0.5, opacity: 0.4 }));

  // Sunset sky cloud lines (wide horizontal wisps)
  for (let i = 0; i < 8; i++) {
    const cy = H * 0.08 + i * 18;
    const cx = W * (0.1 + (i % 3) * 0.3);
    const len = 200 + rng() * 150;
    bg.push(path(
      `M ${cx},${cy} q ${len * 0.3},${(rng() - 0.5) * 8} ${len * 0.6},${(rng() - 0.5) * 5} t ${len * 0.4},0`,
      { width: 0.4, opacity: 0.45 },
    ));
  }
  bg.push(cumulus(W * 0.18, H * 0.16, 1.5, rng));
  bg.push(cumulus(W * 0.55, H * 0.10, 1.8, rng));
  bg.push(cumulus(W * 0.84, H * 0.18, 1.3, rng));
  for (let i = 0; i < 4; i++) {
    bg.push(cloud(150 + i * 320, H * 0.30 + rng() * 25, 1.0, rng));
  }

  // Birds
  bg.push(bird(W * 0.20, H * 0.32, 14, 'detailed'));
  bg.push(bird(W * 0.32, H * 0.36, 9, 'v'));
  bg.push(bird(W * 0.55, H * 0.30, 11, 'v'));
  bg.push(bird(W * 0.74, H * 0.34, 12, 'detailed'));

  // Distant theme park silhouettes (subtle)
  // Castle silhouette (left distance)
  const cstX = W * 0.07;
  const cstBase = horizon - 4;
  // Castle towers
  for (let t = 0; t < 4; t++) {
    const tx = cstX + t * 14;
    const tH = 25 + (t === 1 || t === 2 ? 10 : 0);
    bg.push(rect(tx, cstBase - tH, 10, tH, { width: 0.35, opacity: 0.4 }));
    // Cone roof
    bg.push(path(`M ${tx},${cstBase - tH} L ${tx + 5},${cstBase - tH - 10} L ${tx + 10},${cstBase - tH}`, {
      width: 0.35, opacity: 0.4,
    }));
    // Window
    bg.push(rect(tx + 3, cstBase - tH * 0.6, 4, 5, { width: 0.25, opacity: 0.4 }));
  }
  // Connecting castle wall
  bg.push(rect(cstX, cstBase - 18, 56, 18, { width: 0.35, opacity: 0.4 }));

  // Distant epcot-style sphere
  const epX = W * 0.92;
  const epY = horizon - 18;
  bg.push(circle(epX, epY, 14, { width: 0.4, opacity: 0.4 }));
  // Geodesic pattern hints
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI;
    bg.push(line(epX - Math.cos(a) * 14, epY - Math.sin(a) * 14, epX + Math.cos(a) * 14, epY + Math.sin(a) * 14, {
      width: 0.2, opacity: 0.3,
    }));
  }
  bg.push(line(epX, horizon - 4, epX, epY, { width: 0.4, opacity: 0.4 }));

  // Distant ferris wheel
  const fwX = W * 0.45;
  const fwY = horizon - 16;
  bg.push(circle(fwX, fwY, 16, { width: 0.4, opacity: 0.4 }));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    bg.push(line(fwX, fwY, fwX + Math.cos(a) * 16, fwY + Math.sin(a) * 16, { width: 0.2, opacity: 0.3 }));
    bg.push(circle(fwX + Math.cos(a) * 16, fwY + Math.sin(a) * 16, 1.5, { width: 0.25, opacity: 0.4 }));
  }
  bg.push(line(fwX, fwY + 16, fwX - 6, horizon - 4, { width: 0.3, opacity: 0.4 }));
  bg.push(line(fwX, fwY + 16, fwX + 6, horizon - 4, { width: 0.3, opacity: 0.4 }));

  // Atmospheric haze
  bg.push(hatch(0, horizon - 4, W, 12, 0, 5, { width: 0.18, opacity: 0.18 }));

  // ╭──────────────────────────────────────────────────╮
  // │ MIDGROUND — cylindrical main terminal + concourse arms
  // ╰──────────────────────────────────────────────────╯
  const mg: string[] = [];

  // Main cylindrical terminal (center)
  const ctrX = W * 0.50;
  const ctrTop = H * 0.30;
  const ctrBot = H * 0.78;
  const ctrW = 220;
  const ctrL = ctrX - ctrW / 2;
  const ctrR = ctrX + ctrW / 2;
  // Cylindrical body — ellipse top/bottom + sides
  mg.push(path(
    `M ${ctrL},${ctrTop + 18} A ${ctrW / 2},14 0 0 1 ${ctrR},${ctrTop + 18}`,
    { width: 0.9, opacity: 0.92 },
  ));
  mg.push(path(
    `M ${ctrL},${ctrTop + 18} A ${ctrW / 2},14 0 0 0 ${ctrR},${ctrTop + 18}`,
    { width: 1.2, opacity: 0.95 },
  ));
  // Side walls
  mg.push(line(ctrL, ctrTop + 18, ctrL, ctrBot, { width: 1.0, opacity: 0.92 }));
  mg.push(line(ctrR, ctrTop + 18, ctrR, ctrBot, { width: 1.0, opacity: 0.92 }));
  // Bottom ellipse
  mg.push(path(`M ${ctrL},${ctrBot} A ${ctrW / 2},10 0 0 0 ${ctrR},${ctrBot}`, { width: 1.0, opacity: 0.92 }));
  mg.push(path(`M ${ctrL},${ctrBot} A ${ctrW / 2},10 0 0 1 ${ctrR},${ctrBot}`, { width: 0.5, opacity: 0.6 }));

  // Horizontal floor bands (8 floors)
  const floors = 8;
  for (let f = 1; f < floors; f++) {
    const fy = ctrTop + 18 + (ctrBot - ctrTop - 18) * (f / floors);
    // Slight ellipse curvature on floor band for cylindrical effect
    mg.push(path(`M ${ctrL},${fy} A ${ctrW / 2},6 0 0 1 ${ctrR},${fy}`, { width: 0.4, opacity: 0.7 }));
    mg.push(path(`M ${ctrL},${fy} A ${ctrW / 2},6 0 0 0 ${ctrR},${fy}`, { width: 0.25, opacity: 0.5 }));
  }

  // Window mullions on cylinder (vertical, with curvature simulation via spacing)
  const mullions = 26;
  for (let m = 1; m < mullions; m++) {
    const t = m / mullions;
    // Use sin curve to fake cylinder perspective: edges denser
    const x = ctrL + ctrW * (0.5 - 0.5 * Math.cos(t * Math.PI));
    const fade = Math.sin(t * Math.PI); // edges fade
    mg.push(line(x, ctrTop + 18, x, ctrBot, { width: 0.28, opacity: 0.55 + fade * 0.25 }));
  }

  // Window panel hatching (ambient detail per floor)
  for (let f = 0; f < floors; f++) {
    const fy = ctrTop + 18 + (ctrBot - ctrTop - 18) * (f / floors);
    const fy2 = ctrTop + 18 + (ctrBot - ctrTop - 18) * ((f + 1) / floors);
    if (rng() > 0.5) {
      mg.push(hatch(ctrL + 20 + rng() * 100, fy + 2, 30, fy2 - fy - 4, 30, 1.4, { width: 0.18, opacity: 0.35 }));
    }
  }

  // Radiating concourse arms (left and right)
  const armY = ctrBot - 40;
  // Left arm
  const lArmL = W * 0.06;
  mg.push(line(lArmL, armY, ctrL, armY, { width: 0.7, opacity: 0.9 }));
  mg.push(line(lArmL, armY + 26, ctrL, armY + 26, { width: 0.7, opacity: 0.9 }));
  mg.push(line(lArmL, armY, lArmL, armY + 26, { width: 0.7, opacity: 0.9 }));
  // Left arm windows
  for (let w = 0; w < 18; w++) {
    const wx = lArmL + 6 + w * ((ctrL - lArmL - 12) / 18);
    mg.push(rect(wx, armY + 4, 5, 18, { width: 0.25, opacity: 0.65 }));
  }
  // Right arm
  const rArmR = W * 0.94;
  mg.push(line(ctrR, armY, rArmR, armY, { width: 0.7, opacity: 0.9 }));
  mg.push(line(ctrR, armY + 26, rArmR, armY + 26, { width: 0.7, opacity: 0.9 }));
  mg.push(line(rArmR, armY, rArmR, armY + 26, { width: 0.7, opacity: 0.9 }));
  for (let w = 0; w < 18; w++) {
    const wx = ctrR + 6 + w * ((rArmR - ctrR - 12) / 18);
    mg.push(rect(wx, armY + 4, 5, 18, { width: 0.25, opacity: 0.65 }));
  }

  // People-mover track (elevated rail)
  const pmY = armY - 14;
  mg.push(line(W * 0.06, pmY, W * 0.94, pmY, { width: 0.8, opacity: 0.85 }));
  mg.push(line(W * 0.06, pmY + 4, W * 0.94, pmY + 4, { width: 0.4, opacity: 0.7 }));
  // Pillars
  for (let i = 0; i < 8; i++) {
    const px = W * 0.10 + i * (W * 0.105);
    if (Math.abs(px - ctrX) < 60) continue;
    mg.push(line(px, pmY + 4, px, armY, { width: 0.5, opacity: 0.8 }));
    mg.push(rect(px - 4, pmY + 4, 8, 3, { width: 0.3, opacity: 0.7 }));
  }
  // People-mover car
  const pmCarX = W * 0.30;
  mg.push(rect(pmCarX, pmY - 8, 60, 8, { width: 0.5, opacity: 0.85 }));
  for (let w = 0; w < 6; w++) {
    mg.push(rect(pmCarX + 4 + w * 9, pmY - 6, 7, 5, { width: 0.25, opacity: 0.65 }));
  }

  // Roof underside hatching
  mg.push(hatch(ctrL, ctrTop + 14, ctrW, 6, 45, 1.5, { width: 0.22, opacity: 0.45 }));

  // Tropical signage banners
  mg.push(rect(ctrX - 30, ctrTop + 28, 60, 12, { width: 0.5, opacity: 0.85 }));

  // ╭──────────────────────────────────────────────────╮
  // │ FOREGROUND — palms, flowering bushes, curving road
  // ╰──────────────────────────────────────────────────╯
  const fg: string[] = [];

  // Curving approach road (sweeps in from bottom right)
  const rdPath = `M 0,${H} Q ${W * 0.3},${H * 0.95} ${W * 0.55},${H * 0.86} Q ${W * 0.75},${H * 0.83} ${W},${H * 0.84}`;
  fg.push(path(rdPath, { width: 1.4, opacity: 0.92 }));
  // Road outer edge
  fg.push(path(`M 0,${H + 8} Q ${W * 0.3},${H * 0.97} ${W * 0.55},${H * 0.92} Q ${W * 0.75},${H * 0.89} ${W},${H * 0.90}`, {
    width: 0.7, opacity: 0.85,
  }));
  // Road centerline (dashed)
  for (let i = 0; i < 36; i++) {
    const t = i / 36;
    const sx = (W * 0.55) * t * 0.4 + W * t * 0.6;
    const sy = H * (0.86 + (1 - t) * 0.07);
    fg.push(line(sx, sy + 3, sx + 8, sy + 3, { width: 0.4, opacity: 0.7 }));
  }

  // Tropical landscape — flowering bushes (hatch masses)
  for (let i = 0; i < 18; i++) {
    const bx = W * (0.08 + i * 0.05) + rng() * 20;
    const by = H * (0.86 + rng() * 0.04);
    const bw = 22 + rng() * 18;
    const bh = 14 + rng() * 8;
    // Bush outline
    fg.push(path(`M ${bx},${by} q ${bw * 0.3},${-bh} ${bw * 0.7},${-bh * 0.7} q ${bw * 0.3},${bh * 0.5} ${bw * 0.3},${bh * 0.7} q ${-bw * 0.5},${bh * 0.3} ${-bw * 0.6},0 z`, {
      width: 0.5, opacity: 0.85,
    }));
    fg.push(hatch(bx, by - bh, bw, bh, 30, 2, { width: 0.18, opacity: 0.3 }));
    // Flower dots
    for (let f = 0; f < 6; f++) {
      const fx = bx + rng() * bw;
      const fy = by - rng() * bh;
      fg.push(circle(fx, fy, 0.8, { width: 0.3, fill: '#1a1a1a', opacity: 0.7 }));
    }
  }

  // Foreground palm trees (4-5)
  fg.push(palmTree(W * 0.07, H * 0.88, 1.7, rng));
  fg.push(palmTree(W * 0.20, H * 0.92, 1.2, rng));
  fg.push(palmTree(W * 0.85, H * 0.89, 1.6, rng));
  fg.push(palmTree(W * 0.94, H * 0.92, 1.0, rng));
  fg.push(palmTree(W * 0.42, H * 0.94, 0.9, rng));

  // Grass tufts
  for (let i = 0; i < 80; i++) {
    const gx = rng() * W;
    const gy = H * (0.88 + rng() * 0.08);
    const len = 2 + rng() * 4;
    fg.push(line(gx, gy + len, gx + (rng() - 0.5) * 2, gy, { width: 0.3, opacity: 0.55 }));
  }

  // Foreground ground hatching
  fg.push(hatch(0, H * 0.96, W, H * 0.04, 0, 5, { width: 0.18, opacity: 0.18 }));

  // ╭──────────────────────────────────────────────────╮
  // │ Compose
  // ╰──────────────────────────────────────────────────╯
  const contents = [
    group('background', 0.55, bg.join('')),
    group('midground', 0.85, mg.join('')),
    group('foreground', 1.0, fg.join('')),
  ].join('');

  return svgDocument(W, H, contents);
}
