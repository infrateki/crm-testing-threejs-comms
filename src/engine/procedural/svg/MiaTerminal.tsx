/* MIA — Miami International Airport: curved terminal with palm trees */
import {
  INK, line, rect, path, circle, hatch, palmTree, bird, cloud, cumulus,
  aircraft, group, svgDocument, seedRandom, building,
} from './helpers';

export interface SceneOpts {
  width?: number;
  height?: number;
  seed?: number;
}

export function generateMiaTerminal({ width = 1600, height = 900, seed = 4242 }: SceneOpts = {}): string {
  const W = width, H = height;
  const horizon = H * 0.62;
  const rng = seedRandom(seed);

  // ╭──────────────────────────────────────────────────╮
  // │ BACKGROUND — sky, distant terminal, runway, control tower
  // ╰──────────────────────────────────────────────────╯
  const bg: string[] = [];

  // Atmospheric horizon line
  bg.push(line(0, horizon, W, horizon, { width: 0.5, opacity: 0.4 }));

  // Distant clouds (4 wispy + 2 cumulus)
  for (let i = 0; i < 4; i++) {
    bg.push(cloud(140 + i * 280 + (rng() - 0.5) * 60, H * 0.18 + (rng() - 0.5) * 40, 1.4, rng));
  }
  bg.push(cumulus(W * 0.22, H * 0.13, 1.6, rng));
  bg.push(cumulus(W * 0.78, H * 0.16, 1.4, rng));

  // Birds in sky (varied sizes for atmospheric perspective)
  bg.push(bird(W * 0.18, H * 0.22, 14, 'detailed'));
  bg.push(bird(W * 0.27, H * 0.27, 8, 'v'));
  bg.push(bird(W * 0.74, H * 0.20, 11, 'v'));
  bg.push(bird(W * 0.82, H * 0.24, 6, 'v'));
  bg.push(bird(W * 0.66, H * 0.25, 5, 'v'));

  // Distant runway with perspective
  const rwY = horizon - 8;
  const rwL = W * 0.20, rwR = W * 0.80;
  bg.push(line(rwL, rwY, rwR, rwY, { width: 0.6, opacity: 0.55 }));
  bg.push(line(rwL, rwY + 4, rwR, rwY + 4, { width: 0.4, opacity: 0.4 }));
  // Runway centerline dashes
  for (let i = 0; i < 18; i++) {
    const t = i / 18;
    const cx = rwL + (rwR - rwL) * t;
    const cy = rwY + 2;
    const w = 8 - t * 4;
    bg.push(line(cx, cy, cx + w, cy, { width: 0.5, opacity: 0.5 }));
  }

  // Distant terminal silhouettes (background buildings)
  for (let i = 0; i < 6; i++) {
    const bx = W * 0.05 + i * (W * 0.13);
    const bw = 80 + rng() * 40;
    const bh = 50 + rng() * 30;
    bg.push(building(bx, horizon - 4, bw, bh, {
      cols: 6 + Math.floor(rng() * 4),
      rows: 3,
      opacity: 0.4,
      strokeWidth: 0.4,
      rooftop: rng() > 0.5 ? 'antenna' : 'flat',
    }));
  }

  // Control tower (left-distance)
  const towerX = W * 0.12;
  const towerBase = horizon - 20;
  const towerH = 130;
  // Tower shaft
  bg.push(line(towerX - 4, towerBase, towerX - 4, towerBase - towerH, { width: 0.6, opacity: 0.7 }));
  bg.push(line(towerX + 4, towerBase, towerX + 4, towerBase - towerH, { width: 0.6, opacity: 0.7 }));
  // Tower ladder rungs
  for (let r = 0; r < 12; r++) {
    bg.push(line(towerX - 4, towerBase - 10 - r * 9, towerX + 4, towerBase - 10 - r * 9, { width: 0.25, opacity: 0.5 }));
  }
  // Observation deck
  const obY = towerBase - towerH;
  bg.push(rect(towerX - 14, obY - 16, 28, 16, { width: 0.7, opacity: 0.85 }));
  // Observation windows
  for (let w = 0; w < 6; w++) {
    bg.push(line(towerX - 14 + w * 5.5, obY - 14, towerX - 14 + w * 5.5, obY - 2, { width: 0.3, opacity: 0.7 }));
  }
  bg.push(line(towerX - 14, obY - 8, towerX + 14, obY - 8, { width: 0.3, opacity: 0.7 }));
  // Antenna spire
  bg.push(line(towerX, obY - 16, towerX, obY - 38, { width: 0.5, opacity: 0.85 }));
  bg.push(line(towerX - 3, obY - 30, towerX + 3, obY - 30, { width: 0.3, opacity: 0.7 }));

  // Distant aircraft on tarmac (3)
  bg.push(aircraft(W * 0.32, horizon - 4, 0.7, 'right'));
  bg.push(aircraft(W * 0.55, horizon - 3, 0.6, 'left'));
  bg.push(aircraft(W * 0.70, horizon - 4, 0.55, 'right'));

  // Atmospheric haze hatching across horizon
  bg.push(hatch(0, horizon - 8, W, 16, 0, 4, { width: 0.2, opacity: 0.18 }));

  // ╭──────────────────────────────────────────────────╮
  // │ MIDGROUND — main curved terminal building
  // ╰──────────────────────────────────────────────────╯
  const mg: string[] = [];

  const termL = W * 0.10;
  const termR = W * 0.90;
  const termTop = H * 0.36;
  const termFloor = H * 0.78;
  const termW = termR - termL;
  // Curved swooping roof — quintessential MIA signature
  // Roof goes from termL(elevated) UP and DOWN curving across
  const roofY = termTop;
  const roofPeak = termTop - 28;
  mg.push(path(
    `M ${termL},${roofY + 12} Q ${termL + termW * 0.30},${roofPeak - 8} ${termL + termW * 0.5},${roofY - 18} Q ${termL + termW * 0.70},${roofPeak - 4} ${termR},${roofY + 8}`,
    { width: 1.6, opacity: 0.95 },
  ));
  // Secondary roof line (thickness)
  mg.push(path(
    `M ${termL + 4},${roofY + 14} Q ${termL + termW * 0.30 + 2},${roofPeak - 4} ${termL + termW * 0.5},${roofY - 14} Q ${termL + termW * 0.70 - 2},${roofPeak} ${termR - 4},${roofY + 10}`,
    { width: 0.6, opacity: 0.65 },
  ));
  // Roof structural ribs (radial lines from center)
  for (let i = 0; i < 18; i++) {
    const t = i / 17;
    const px = termL + termW * t;
    const py = roofY + 12 + Math.sin(t * Math.PI) * (-28);
    mg.push(line(px, py + 2, px, roofY + 18, { width: 0.3, opacity: 0.6 }));
  }
  // Roof underside hatching (shadow)
  mg.push(hatch(termL + 20, roofY + 6, termW - 40, 14, 45, 2.2, { width: 0.25, opacity: 0.45 }));

  // Main terminal body — glass curtain wall
  const wallTop = roofY + 18;
  const wallH = termFloor - wallTop;
  // Outer frame
  mg.push(rect(termL + 6, wallTop, termW - 12, wallH, { width: 0.8, opacity: 0.85 }));
  // Glass curtain wall with detailed mullions
  const cols = 36;
  const rows = 4;
  const cellW = (termW - 12) / cols;
  const cellH = wallH / rows;
  // Vertical mullions
  for (let c = 1; c < cols; c++) {
    const cx = termL + 6 + c * cellW;
    mg.push(line(cx, wallTop, cx, wallTop + wallH, { width: 0.28, opacity: 0.7 }));
  }
  // Horizontal floor lines
  for (let r = 1; r < rows; r++) {
    const ry = wallTop + r * cellH;
    mg.push(line(termL + 6, ry, termL + 6 + termW - 12, ry, { width: 0.32, opacity: 0.75 }));
  }
  // Highlight ~12 random panels with subtle hatching
  for (let i = 0; i < 22; i++) {
    const c = Math.floor(rng() * cols);
    const r = Math.floor(rng() * rows);
    mg.push(hatch(termL + 6 + c * cellW + 0.5, wallTop + r * cellH + 0.5, cellW - 1, cellH - 1, 30, 1.3, { width: 0.18, opacity: 0.35 }));
  }

  // Structural columns (visible behind glass)
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const cx = termL + 12 + (termW - 24) * t;
    mg.push(line(cx, wallTop, cx, termFloor, { width: 1.0, opacity: 0.75 }));
    // Capital
    mg.push(rect(cx - 4, wallTop - 2, 8, 4, { width: 0.4, opacity: 0.7 }));
  }

  // Canopy overhang
  const canopyY = wallTop + wallH * 0.35;
  mg.push(line(termL - 8, canopyY, termR + 8, canopyY, { width: 1.2, opacity: 0.9 }));
  mg.push(line(termL - 8, canopyY + 3, termR + 8, canopyY + 3, { width: 0.5, opacity: 0.7 }));
  // Cross-hatching beneath canopy (shadow)
  mg.push(hatch(termL, canopyY + 3, termW, 8, 45, 2.2, { width: 0.3, opacity: 0.55 }));

  // Terminal signage area
  const signY = wallTop + 10;
  mg.push(rect(termL + termW * 0.42, signY, termW * 0.16, 16, { width: 0.5, opacity: 0.75 }));
  mg.push(line(termL + termW * 0.45, signY + 8, termL + termW * 0.55, signY + 8, { width: 0.3, opacity: 0.5 }));

  // Jet bridges extending from terminal
  for (let i = 0; i < 3; i++) {
    const jbX = termL + termW * (0.20 + i * 0.27);
    const jbY = wallTop + wallH;
    const jbExtend = 30 + rng() * 12;
    // Bridge tube
    mg.push(rect(jbX - 4, jbY, 8, jbExtend, { width: 0.6, opacity: 0.85 }));
    // Connection joint
    mg.push(circle(jbX, jbY + jbExtend, 5, { width: 0.5, opacity: 0.85 }));
    // Window strip on bridge
    for (let w = 0; w < 5; w++) {
      mg.push(rect(jbX - 3, jbY + 5 + w * 5, 6, 3, { width: 0.25, opacity: 0.7 }));
    }
  }

  // Aircraft parked at gates
  mg.push(aircraft(termL + termW * 0.20, termFloor + 8, 1.0, 'right'));
  mg.push(aircraft(termL + termW * 0.47, termFloor + 8, 1.0, 'left'));
  mg.push(aircraft(termL + termW * 0.74, termFloor + 8, 1.0, 'right'));

  // ╭──────────────────────────────────────────────────╮
  // │ FOREGROUND — palm trees, ground, grass tufts
  // ╰──────────────────────────────────────────────────╯
  const fg: string[] = [];

  // Ground line
  fg.push(line(0, H * 0.86, W, H * 0.86, { width: 1.2, opacity: 0.9 }));

  // Sidewalk lines
  fg.push(line(0, H * 0.92, W, H * 0.92, { width: 0.5, opacity: 0.7 }));
  for (let i = 0; i < 24; i++) {
    const cx = (i / 24) * W;
    fg.push(line(cx, H * 0.86, cx, H * 0.92, { width: 0.25, opacity: 0.4 }));
  }

  // Curb-line hatching
  fg.push(hatch(0, H * 0.92, W, 8, 30, 4, { width: 0.2, opacity: 0.3 }));

  // Grass tufts at foreground
  for (let i = 0; i < 60; i++) {
    const gx = rng() * W;
    const gy = H * 0.86 - rng() * 6;
    const len = 2 + rng() * 4;
    fg.push(line(gx, gy + len, gx + (rng() - 0.5) * 2, gy, { width: 0.3, opacity: 0.65 }));
  }

  // Palm trees: 4 large foreground palms
  fg.push(palmTree(W * 0.08, H * 0.86, 1.6, rng));
  fg.push(palmTree(W * 0.92, H * 0.87, 1.5, rng));
  fg.push(palmTree(W * 0.30, H * 0.88, 1.0, rng));
  fg.push(palmTree(W * 0.72, H * 0.88, 1.1, rng));

  // Bench / bollards (right foreground)
  const benchX = W * 0.55;
  const benchY = H * 0.89;
  fg.push(line(benchX, benchY, benchX + 30, benchY, { width: 0.7, opacity: 0.85 }));
  fg.push(line(benchX, benchY, benchX, benchY + 6, { width: 0.5, opacity: 0.75 }));
  fg.push(line(benchX + 30, benchY, benchX + 30, benchY + 6, { width: 0.5, opacity: 0.75 }));
  fg.push(line(benchX + 6, benchY + 6, benchX + 6, benchY + 14, { width: 0.4, opacity: 0.7 }));
  fg.push(line(benchX + 24, benchY + 6, benchX + 24, benchY + 14, { width: 0.4, opacity: 0.7 }));

  // Foreground ground hatching
  fg.push(hatch(0, H * 0.94, W, H * 0.06, 0, 6, { width: 0.18, opacity: 0.2 }));

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

void INK;
