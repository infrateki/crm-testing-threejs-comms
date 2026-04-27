/* Federal — Neoclassical government building with columns, pediment, formal landscape */
import {
  INK, line, rect, path, circle, hatch, deciduousTree, bird, cumulus, cloud,
  group, svgDocument, seedRandom, building,
} from './helpers';

export interface SceneOpts {
  width?: number;
  height?: number;
  seed?: number;
}

export function generateFederalBuilding({ width = 1600, height = 900, seed = 9090 }: SceneOpts = {}): string {
  const W = width, H = height;
  const horizon = H * 0.78;
  const rng = seedRandom(seed);

  // ╭──────────────────────────────────────────────────╮
  // │ BACKGROUND — sky, distant gov buildings, flag
  // ╰──────────────────────────────────────────────────╯
  const bg: string[] = [];

  // Sky clouds
  bg.push(cumulus(W * 0.20, H * 0.10, 1.5, rng));
  bg.push(cumulus(W * 0.65, H * 0.12, 1.8, rng));
  for (let i = 0; i < 5; i++) {
    bg.push(cloud(150 + i * 280, H * 0.18 + rng() * 30, 1.1, rng));
  }

  // Birds
  bg.push(bird(W * 0.18, H * 0.20, 12, 'detailed'));
  bg.push(bird(W * 0.32, H * 0.16, 9, 'v'));
  bg.push(bird(W * 0.62, H * 0.22, 14, 'detailed'));
  bg.push(bird(W * 0.80, H * 0.18, 8, 'v'));

  // Distant horizon line
  bg.push(line(0, horizon, W, horizon, { width: 0.5, opacity: 0.4 }));

  // Distant government buildings (flanking the main building)
  for (let i = 0; i < 4; i++) {
    const bx = W * 0.02 + i * (W * 0.08);
    bg.push(building(bx, horizon - 4, 60, 70, {
      cols: 5, rows: 5, opacity: 0.4, strokeWidth: 0.35, rooftop: i === 1 ? 'dome' : 'flat',
    }));
  }
  for (let i = 0; i < 4; i++) {
    const bx = W * 0.66 + i * (W * 0.08);
    bg.push(building(bx, horizon - 4, 65, 75, {
      cols: 5, rows: 5, opacity: 0.4, strokeWidth: 0.35, rooftop: i === 2 ? 'dome' : 'flat',
    }));
  }

  // Distant Capitol-dome structure (background reference)
  const domeX = W * 0.50;
  const domeBase = horizon - 4;
  // Dome
  bg.push(path(`M ${domeX - 30},${domeBase - 60} A 30,30 0 0 1 ${domeX + 30},${domeBase - 60}`, { width: 0.5, opacity: 0.45 }));
  // Drum
  bg.push(rect(domeX - 30, domeBase - 60, 60, 12, { width: 0.5, opacity: 0.45 }));
  // Drum windows
  for (let i = 0; i < 5; i++) {
    bg.push(rect(domeX - 26 + i * 12, domeBase - 58, 6, 8, { width: 0.3, opacity: 0.4 }));
  }
  // Spire
  bg.push(line(domeX, domeBase - 90, domeX, domeBase - 105, { width: 0.4, opacity: 0.45 }));
  bg.push(circle(domeX, domeBase - 92, 2, { width: 0.4, fill: INK, opacity: 0.5 }));
  // Lantern
  bg.push(rect(domeX - 5, domeBase - 86, 10, 6, { width: 0.4, opacity: 0.45 }));

  // Distant trees lining the boulevard
  for (let i = 0; i < 12; i++) {
    const tx = W * 0.10 + i * (W * 0.07);
    if (Math.abs(tx - W * 0.50) < W * 0.10) continue;
    // Simple tree silhouette
    bg.push(line(tx, horizon - 4, tx, horizon - 18, { width: 0.4, opacity: 0.45 }));
    bg.push(circle(tx, horizon - 22, 6, { width: 0.4, opacity: 0.4 }));
    // Foliage hatch
    bg.push(hatch(tx - 6, horizon - 28, 12, 12, 30, 1.5, { width: 0.18, opacity: 0.3 }));
  }

  // Atmospheric haze
  bg.push(hatch(0, horizon - 4, W, 8, 0, 4, { width: 0.18, opacity: 0.15 }));

  // ╭──────────────────────────────────────────────────╮
  // │ MIDGROUND — Neoclassical building with columns
  // ╰──────────────────────────────────────────────────╯
  const mg: string[] = [];

  const bldL = W * 0.18;
  const bldR = W * 0.82;
  const bldW = bldR - bldL;
  const bldBase = H * 0.82;
  const bldTop = H * 0.36;

  // Stylobate / steps (3-tier base)
  for (let s = 0; s < 4; s++) {
    const sw = bldW + 60 - s * 12;
    const sx = bldL - 30 + s * 6;
    const sy = bldBase + s * 5;
    mg.push(rect(sx, sy, sw, 5, { width: 0.6, opacity: 0.92 }));
  }
  // Step shadow hatch
  mg.push(hatch(bldL - 30, bldBase, bldW + 60, 4, 0, 1.5, { width: 0.2, opacity: 0.4 }));

  // Building base (podium)
  const podBase = bldBase;
  const podTop = bldBase - 20;
  mg.push(rect(bldL, podTop, bldW, 20, { width: 0.7, opacity: 0.92 }));
  // Podium horizontal lines
  mg.push(line(bldL, podTop + 7, bldR, podTop + 7, { width: 0.3, opacity: 0.55 }));
  mg.push(line(bldL, podTop + 14, bldR, podTop + 14, { width: 0.3, opacity: 0.55 }));

  // 8 Corinthian columns
  const colCount = 8;
  const colSpace = (bldW - 40) / (colCount - 1);
  const colTop = bldTop + 50; // leave room for pediment
  const colBase = podTop;
  const colW = 18;
  for (let c = 0; c < colCount; c++) {
    const cx = bldL + 20 + c * colSpace;
    // Capital
    mg.push(rect(cx - colW / 2 - 3, colTop, colW + 6, 8, { width: 0.6, opacity: 0.9 }));
    mg.push(rect(cx - colW / 2 - 5, colTop - 4, colW + 10, 4, { width: 0.5, opacity: 0.85 }));
    // Acanthus volutes
    mg.push(circle(cx - colW / 2 - 2, colTop, 2, { width: 0.4, opacity: 0.85 }));
    mg.push(circle(cx + colW / 2 + 2, colTop, 2, { width: 0.4, opacity: 0.85 }));
    // Shaft
    mg.push(rect(cx - colW / 2, colTop + 8, colW, colBase - colTop - 8, { width: 0.6, opacity: 0.92 }));
    // Fluting (vertical grooves)
    for (let f = 1; f < 8; f++) {
      const fx = cx - colW / 2 + f * (colW / 8);
      mg.push(line(fx, colTop + 10, fx, colBase - 4, { width: 0.2, opacity: 0.55 }));
    }
    // Base
    mg.push(rect(cx - colW / 2 - 2, colBase - 4, colW + 4, 4, { width: 0.5, opacity: 0.9 }));
    mg.push(rect(cx - colW / 2 - 4, colBase - 8, colW + 8, 4, { width: 0.5, opacity: 0.9 }));
    // Column shadow hatching
    mg.push(hatch(cx + colW / 2 - 4, colTop + 12, 4, colBase - colTop - 16, 90, 1.2, { width: 0.18, opacity: 0.4 }));
  }

  // Cornice / entablature above columns
  const corniceY = colTop - 4;
  mg.push(rect(bldL, corniceY - 10, bldW, 10, { width: 0.7, opacity: 0.92 }));
  // Cornice molding lines
  mg.push(line(bldL, corniceY - 4, bldR, corniceY - 4, { width: 0.4, opacity: 0.65 }));
  mg.push(line(bldL, corniceY - 7, bldR, corniceY - 7, { width: 0.3, opacity: 0.55 }));
  // Dentil molding (small repeated rectangles)
  for (let d = 0; d < 80; d++) {
    const dx = bldL + 4 + d * ((bldW - 8) / 80);
    mg.push(rect(dx, corniceY - 6, 4, 2, { width: 0.18, opacity: 0.55 }));
  }

  // Triangular pediment
  const pedBase = corniceY - 10;
  const pedPeak = bldTop;
  const pedL = bldL + 10;
  const pedR = bldR - 10;
  mg.push(path(`M ${pedL},${pedBase} L ${(pedL + pedR) / 2},${pedPeak} L ${pedR},${pedBase} Z`, {
    width: 0.8, opacity: 0.92,
  }));
  // Pediment relief hatching
  mg.push(hatch(pedL + 20, pedPeak + 14, pedR - pedL - 40, pedBase - pedPeak - 16, 30, 2, { width: 0.18, opacity: 0.3 }));
  // Central relief sculpture (eagle/seal placeholder)
  const pedCx = (pedL + pedR) / 2;
  const pedCy = pedPeak + (pedBase - pedPeak) * 0.6;
  mg.push(circle(pedCx, pedCy, 10, { width: 0.4, opacity: 0.7 }));
  mg.push(path(`M ${pedCx - 16},${pedCy} q 8,-4 16,0 q 8,4 16,0`, { width: 0.4, opacity: 0.7 }));
  // Acroteria (corner ornaments)
  mg.push(circle(pedL, pedBase, 2.5, { width: 0.4, opacity: 0.85 }));
  mg.push(circle(pedR, pedBase, 2.5, { width: 0.4, opacity: 0.85 }));
  mg.push(circle(pedCx, pedPeak, 3, { width: 0.4, opacity: 0.85 }));

  // Building wall behind columns (3-story window grid)
  const wallL = bldL + 15;
  const wallR = bldR - 15;
  const wallTop_ = colTop + 10;
  const wallBot = colBase - 10;
  const winRows = 3;
  const winCols = 16;
  const cellW = (wallR - wallL) / winCols;
  const cellH = (wallBot - wallTop_) / winRows;
  for (let r = 0; r < winRows; r++) {
    for (let c = 0; c < winCols; c++) {
      const wx = wallL + c * cellW + 2;
      const wy = wallTop_ + r * cellH + 2;
      const ww = cellW - 4;
      const wh = cellH - 4;
      // Window frame
      mg.push(rect(wx, wy, ww, wh, { width: 0.4, opacity: 0.7 }));
      // Mullion cross
      mg.push(line(wx + ww / 2, wy, wx + ww / 2, wy + wh, { width: 0.25, opacity: 0.55 }));
      mg.push(line(wx, wy + wh / 2, wx + ww, wy + wh / 2, { width: 0.25, opacity: 0.55 }));
      // Keystone above window (top row only)
      if (r === 0) {
        mg.push(path(`M ${wx + ww / 2 - 3},${wy} L ${wx + ww / 2},${wy - 4} L ${wx + ww / 2 + 3},${wy} Z`, {
          width: 0.3, opacity: 0.7,
        }));
      }
      // Sill below window
      mg.push(line(wx - 1, wy + wh + 1, wx + ww + 1, wy + wh + 1, { width: 0.3, opacity: 0.55 }));
    }
  }

  // Massive entrance doors (center, behind columns, 3-bay tall)
  const doorL = bldL + bldW * 0.42;
  const doorR = bldL + bldW * 0.58;
  const doorTop = colBase - 50;
  const doorBot = colBase;
  mg.push(rect(doorL, doorTop, doorR - doorL, doorBot - doorTop, { width: 0.7, opacity: 0.9 }));
  mg.push(line((doorL + doorR) / 2, doorTop, (doorL + doorR) / 2, doorBot, { width: 0.5, opacity: 0.7 }));
  // Arched top
  mg.push(path(`M ${doorL},${doorTop} A ${(doorR - doorL) / 2},20 0 0 1 ${doorR},${doorTop}`, { width: 0.6, opacity: 0.85 }));
  // Door panel divisions
  for (let i = 1; i < 4; i++) {
    const dy = doorTop + i * ((doorBot - doorTop) / 4);
    mg.push(line(doorL + 2, dy, doorR - 2, dy, { width: 0.3, opacity: 0.55 }));
  }
  // Door shadow hatch
  mg.push(hatch(doorL + 2, doorTop + 4, doorR - doorL - 4, doorBot - doorTop - 8, 45, 1.5, { width: 0.18, opacity: 0.5 }));

  // ╭──────────────────────────────────────────────────╮
  // │ FOREGROUND — formal landscaping, hedges, flag, walkway
  // ╰──────────────────────────────────────────────────╯
  const fg: string[] = [];

  // Ground line
  fg.push(line(0, H * 0.92, W, H * 0.92, { width: 1.2, opacity: 0.92 }));

  // Central walkway (perspective)
  fg.push(line(W * 0.46, H * 0.92, W * 0.40, H * 0.99, { width: 0.6, opacity: 0.85 }));
  fg.push(line(W * 0.54, H * 0.92, W * 0.60, H * 0.99, { width: 0.6, opacity: 0.85 }));
  // Walkway pavers
  for (let i = 0; i < 8; i++) {
    const t = i / 8;
    const lx = W * 0.46 - t * (W * 0.06);
    const rx = W * 0.54 + t * (W * 0.06);
    const wy = H * 0.92 + t * (H * 0.07);
    fg.push(line(lx, wy, rx, wy, { width: 0.3, opacity: 0.65 }));
  }

  // Formal hedges (left and right of walkway)
  for (let h = 0; h < 6; h++) {
    const hx = W * 0.04 + h * (W * 0.07);
    const hy = H * 0.92;
    fg.push(rect(hx, hy - 14, 70, 14, { width: 0.5, opacity: 0.88 }));
    // Hedge texture (dense hatching)
    fg.push(hatch(hx, hy - 14, 70, 14, 30, 1.4, { width: 0.18, opacity: 0.5 }));
    fg.push(hatch(hx, hy - 14, 70, 14, 60, 1.6, { width: 0.18, opacity: 0.45 }));
    // Top texture (foliage suggestion)
    for (let f = 0; f < 14; f++) {
      const fx = hx + f * 5 + rng() * 2;
      fg.push(path(`M ${fx},${hy - 14} q 1,-2 2,0`, { width: 0.25, opacity: 0.6 }));
    }
  }
  for (let h = 0; h < 6; h++) {
    const hx = W * 0.55 + h * (W * 0.07);
    const hy = H * 0.92;
    fg.push(rect(hx, hy - 14, 70, 14, { width: 0.5, opacity: 0.88 }));
    fg.push(hatch(hx, hy - 14, 70, 14, 30, 1.4, { width: 0.18, opacity: 0.5 }));
    fg.push(hatch(hx, hy - 14, 70, 14, 60, 1.6, { width: 0.18, opacity: 0.45 }));
    for (let f = 0; f < 14; f++) {
      const fx = hx + f * 5 + rng() * 2;
      fg.push(path(`M ${fx},${hy - 14} q 1,-2 2,0`, { width: 0.25, opacity: 0.6 }));
    }
  }

  // Flag poles flanking entrance
  const flagPoles: [number, number][] = [[W * 0.36, H * 0.92], [W * 0.64, H * 0.92]];
  for (const [px, py] of flagPoles) {
    // Pole
    fg.push(line(px, py, px, py - 90, { width: 0.7, opacity: 0.92 }));
    // Pole base
    fg.push(rect(px - 3, py, 6, 4, { width: 0.5, opacity: 0.92 }));
    // Pole top finial
    fg.push(circle(px, py - 90, 2, { width: 0.4, opacity: 0.9 }));
    // Flag with fold lines
    const flagW = 36;
    const flagH = 22;
    fg.push(path(
      `M ${px},${py - 88} L ${px + flagW},${py - 86} Q ${px + flagW + 4},${py - 80} ${px + flagW},${py - 76} L ${px + flagW - 6},${py - 70} L ${px},${py - 66} Z`,
      { width: 0.5, opacity: 0.95 },
    ));
    // Flag fold lines (horizontal stripes — abstracted)
    for (let s = 1; s < 7; s++) {
      const sy = py - 86 + s * (flagH / 7);
      fg.push(path(`M ${px + 1},${sy} q ${flagW * 0.4},${(rng() - 0.5) * 2} ${flagW - 4},${(rng() - 0.5) * 1.5}`, {
        width: 0.3, opacity: 0.7,
      }));
    }
    // Flag canton (star area, top-left corner) — small box
    fg.push(rect(px + 1, py - 86, flagW * 0.4, flagH * 0.5, { width: 0.3, opacity: 0.7 }));
  }

  // Foreground deciduous trees
  fg.push(deciduousTree(W * 0.10, H * 0.92, 1.4, rng));
  fg.push(deciduousTree(W * 0.90, H * 0.92, 1.5, rng));

  // Bollards lining walkway entrance
  for (let i = 0; i < 4; i++) {
    const bx = W * 0.42 + i * (W * 0.04);
    fg.push(rect(bx - 2, H * 0.92 - 6, 4, 6, { width: 0.4, opacity: 0.85 }));
    fg.push(circle(bx, H * 0.92 - 6, 2.5, { width: 0.4, opacity: 0.85 }));
  }

  // Lawn texture hatching (subtle ground texture)
  fg.push(hatch(0, H * 0.92, W * 0.42, 8, 0, 5, { width: 0.18, opacity: 0.18 }));
  fg.push(hatch(W * 0.58, H * 0.92, W * 0.42, 8, 0, 5, { width: 0.18, opacity: 0.18 }));

  // ╭──────────────────────────────────────────────────╮
  // │ Compose
  // ╰──────────────────────────────────────────────────╯
  void podBase;
  const contents = [
    group('background', 0.55, bg.join('')),
    group('midground', 0.85, mg.join('')),
    group('foreground', 1.0, fg.join('')),
  ].join('');

  return svgDocument(W, H, contents);
}
