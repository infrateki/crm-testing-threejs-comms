/* DFW — Dallas/Fort Worth: wide horizontal terminal with repeated bays */
import {
  line, rect, path, circle, hatch, bird, cumulus, cloud, aircraft,
  group, svgDocument, seedRandom, building,
} from './helpers';

export interface SceneOpts {
  width?: number;
  height?: number;
  seed?: number;
}

export function generateDfwTerminal({ width = 1600, height = 900, seed = 3838 }: SceneOpts = {}): string {
  const W = width, H = height;
  const horizon = H * 0.60;
  const rng = seedRandom(seed);

  // ╭──────────────────────────────────────────────────╮
  // │ BACKGROUND — Texas prairie horizon, sky, distant infra
  // ╰──────────────────────────────────────────────────╯
  const bg: string[] = [];

  // Distant flat horizon
  bg.push(line(0, horizon, W, horizon, { width: 0.5, opacity: 0.45 }));

  // Cumulus clouds — characteristic Texas big sky
  bg.push(cumulus(W * 0.15, H * 0.10, 1.8, rng));
  bg.push(cumulus(W * 0.42, H * 0.14, 1.5, rng));
  bg.push(cumulus(W * 0.68, H * 0.08, 2.0, rng));
  bg.push(cumulus(W * 0.88, H * 0.18, 1.4, rng));
  for (let i = 0; i < 5; i++) {
    bg.push(cloud(120 + i * 280 + rng() * 50, H * 0.22 + rng() * 30, 1.0, rng));
  }

  // Birds (prairie wide-open sky)
  bg.push(bird(W * 0.12, H * 0.30, 13, 'detailed'));
  bg.push(bird(W * 0.25, H * 0.28, 8, 'v'));
  bg.push(bird(W * 0.55, H * 0.32, 10, 'v'));
  bg.push(bird(W * 0.78, H * 0.26, 14, 'detailed'));
  bg.push(bird(W * 0.88, H * 0.34, 7, 'v'));

  // Distant taxiway with aircraft
  const taxiY = horizon - 8;
  bg.push(line(0, taxiY, W, taxiY, { width: 0.5, opacity: 0.55 }));
  bg.push(line(0, taxiY + 5, W, taxiY + 5, { width: 0.4, opacity: 0.45 }));
  for (let i = 0; i < 24; i++) {
    bg.push(line(40 + i * 65, taxiY + 2, 50 + i * 65, taxiY + 2, { width: 0.4, opacity: 0.5 }));
  }

  // Aircraft on distant taxiway
  bg.push(aircraft(W * 0.25, taxiY - 3, 0.55, 'right'));
  bg.push(aircraft(W * 0.50, taxiY - 3, 0.55, 'left'));
  bg.push(aircraft(W * 0.78, taxiY - 3, 0.55, 'right'));

  // Distant control tower (right)
  const ctX = W * 0.93;
  const ctBase = horizon - 8;
  const ctH = 110;
  bg.push(line(ctX - 3, ctBase, ctX - 3, ctBase - ctH, { width: 0.5, opacity: 0.7 }));
  bg.push(line(ctX + 3, ctBase, ctX + 3, ctBase - ctH, { width: 0.5, opacity: 0.7 }));
  bg.push(rect(ctX - 11, ctBase - ctH - 14, 22, 14, { width: 0.5, opacity: 0.85 }));
  for (let w = 0; w < 5; w++) {
    bg.push(line(ctX - 11 + w * 5, ctBase - ctH - 12, ctX - 11 + w * 5, ctBase - ctH - 2, { width: 0.25, opacity: 0.7 }));
  }
  bg.push(line(ctX, ctBase - ctH - 14, ctX, ctBase - ctH - 36, { width: 0.4, opacity: 0.85 }));

  // Distant infrastructure: radar dome, wind sock, hangar
  // Radar dome (left)
  const rdX = W * 0.06;
  bg.push(circle(rdX, horizon - 12, 8, { width: 0.5, opacity: 0.7 }));
  bg.push(line(rdX - 8, horizon - 12, rdX + 8, horizon - 12, { width: 0.4, opacity: 0.7 }));
  bg.push(line(rdX, horizon - 12, rdX, horizon - 4, { width: 0.4, opacity: 0.7 }));

  // Wind sock pole
  const wsX = W * 0.35;
  bg.push(line(wsX, horizon - 4, wsX, horizon - 28, { width: 0.5, opacity: 0.7 }));
  bg.push(path(`M ${wsX},${horizon - 28} l 14,2 l -2,4 l -10,2 z`, { width: 0.4, opacity: 0.7 }));

  // Distant hangar
  const hgX = W * 0.65;
  bg.push(rect(hgX, horizon - 18, 60, 18, { width: 0.5, opacity: 0.6 }));
  bg.push(path(`M ${hgX},${horizon - 18} L ${hgX + 30},${horizon - 26} L ${hgX + 60},${horizon - 18}`, { width: 0.5, opacity: 0.6 }));

  // Distant building silhouettes (small ones for prairie scale)
  for (let i = 0; i < 4; i++) {
    const bx = W * 0.10 + i * (W * 0.18);
    bg.push(building(bx, horizon - 4, 50, 22, {
      cols: 4, rows: 2, opacity: 0.35, strokeWidth: 0.3, rooftop: 'flat',
    }));
  }

  // Atmospheric haze at horizon
  bg.push(hatch(0, horizon - 4, W, 8, 0, 4, { width: 0.18, opacity: 0.18 }));

  // ╭──────────────────────────────────────────────────╮
  // │ MIDGROUND — long horizontal terminal with repeated bays
  // ╰──────────────────────────────────────────────────╯
  const mg: string[] = [];

  const termL = W * 0.04;
  const termR = W * 0.96;
  const termTop = H * 0.42;
  const termFloor = H * 0.78;
  const termW = termR - termL;
  const termH = termFloor - termTop;

  // 14 structural bays, each with canopy + columns + glass
  const bays = 14;
  const bayW = termW / bays;
  // Continuous roof line
  mg.push(line(termL, termTop, termR, termTop, { width: 1.4, opacity: 0.92 }));
  mg.push(line(termL, termTop + 6, termR, termTop + 6, { width: 0.6, opacity: 0.7 }));

  // Each bay
  for (let b = 0; b < bays; b++) {
    const bx = termL + b * bayW;
    // Bay frame
    mg.push(line(bx, termTop, bx, termFloor, { width: 0.7, opacity: 0.8 }));
    // Bay column at base
    mg.push(line(bx + 2, termFloor - 8, bx + 2, termFloor, { width: 0.5, opacity: 0.7 }));
    // Glass section in bay (mullions)
    const gTop = termTop + 14;
    const gH = termH - 14;
    const gCols = 4;
    const gRows = 4;
    const cw = (bayW - 4) / gCols;
    const ch = gH / gRows;
    for (let c = 1; c < gCols; c++) {
      mg.push(line(bx + 2 + c * cw, gTop, bx + 2 + c * cw, gTop + gH, { width: 0.25, opacity: 0.65 }));
    }
    for (let r = 1; r < gRows; r++) {
      mg.push(line(bx + 2, gTop + r * ch, bx + 2 + bayW - 4, gTop + r * ch, { width: 0.28, opacity: 0.7 }));
    }
    // Bay canopy detail
    mg.push(line(bx, termTop + 4, bx + bayW, termTop + 4, { width: 0.4, opacity: 0.65 }));
    // Random shaded windows
    if (rng() > 0.6) {
      const c = Math.floor(rng() * gCols);
      const r = Math.floor(rng() * gRows);
      mg.push(hatch(bx + 2 + c * cw + 0.5, gTop + r * ch + 0.5, cw - 1, ch - 1, 45, 1.3, { width: 0.18, opacity: 0.4 }));
    }
  }
  // Final right-edge column
  mg.push(line(termR, termTop, termR, termFloor, { width: 0.7, opacity: 0.8 }));

  // Roof underside shadow hatching
  mg.push(hatch(termL, termTop + 6, termW, 10, 45, 2, { width: 0.25, opacity: 0.45 }));

  // Multiple jet bridges at varying angles
  for (let i = 0; i < 5; i++) {
    const jbX = termL + termW * (0.10 + i * 0.18);
    const jbY = termFloor;
    const jbLen = 26 + rng() * 14;
    const jbAngle = (rng() - 0.5) * 0.4; // small variation
    const ex = jbX + Math.sin(jbAngle) * jbLen;
    const ey = jbY + Math.cos(jbAngle) * jbLen;
    mg.push(line(jbX - 3, jbY, ex - 3, ey, { width: 0.5, opacity: 0.85 }));
    mg.push(line(jbX + 3, jbY, ex + 3, ey, { width: 0.5, opacity: 0.85 }));
    // Bridge windows
    for (let w = 0; w < 4; w++) {
      const t = (w + 0.5) / 4;
      const wx = jbX + (ex - jbX) * t;
      const wy = jbY + (ey - jbY) * t;
      mg.push(rect(wx - 2.5, wy - 1, 5, 2, { width: 0.2, opacity: 0.7 }));
    }
    // End connector
    mg.push(circle(ex, ey, 4, { width: 0.5, opacity: 0.85 }));
  }

  // Aircraft parked between jet bridges
  mg.push(aircraft(termL + termW * 0.22, termFloor + 18, 1.0, 'right'));
  mg.push(aircraft(termL + termW * 0.40, termFloor + 18, 1.0, 'left'));
  mg.push(aircraft(termL + termW * 0.58, termFloor + 18, 1.0, 'right'));
  mg.push(aircraft(termL + termW * 0.76, termFloor + 18, 1.0, 'left'));

  // Large terminal signage
  const signX = termL + termW * 0.43;
  const signY = termTop + 10;
  mg.push(rect(signX, signY, termW * 0.14, 18, { width: 0.6, opacity: 0.85 }));
  mg.push(line(signX + 8, signY + 9, signX + termW * 0.14 - 8, signY + 9, { width: 0.4, opacity: 0.6 }));
  mg.push(line(signX + 8, signY + 13, signX + termW * 0.14 - 14, signY + 13, { width: 0.3, opacity: 0.5 }));

  // ╭──────────────────────────────────────────────────╮
  // │ FOREGROUND — vehicle lanes, light poles, shuttle, signage
  // ╰──────────────────────────────────────────────────╯
  const fg: string[] = [];

  // Pavement / vehicle lanes
  const pvY = H * 0.82;
  const pvBot = H * 0.97;
  fg.push(line(0, pvY, W, pvY, { width: 1.0, opacity: 0.85 }));
  fg.push(line(0, pvBot, W, pvBot, { width: 0.8, opacity: 0.8 }));
  // 3 lanes with dashed dividers
  for (let l = 1; l < 3; l++) {
    const ly = pvY + (pvBot - pvY) * (l / 3);
    for (let i = 0; i < 28; i++) {
      const x = i * (W / 28);
      fg.push(line(x, ly, x + W / 56, ly, { width: 0.5, opacity: 0.7 }));
    }
  }
  // Solid edge lanes
  fg.push(line(0, pvY + 6, W, pvY + 6, { width: 0.6, opacity: 0.8 }));
  fg.push(line(0, pvBot - 6, W, pvBot - 6, { width: 0.6, opacity: 0.8 }));

  // Pavement texture hatching
  fg.push(hatch(0, pvY + 6, W, pvBot - pvY - 12, 0, 3, { width: 0.15, opacity: 0.15 }));

  // Light poles with detailed fixtures (5 across)
  for (let i = 0; i < 6; i++) {
    const lpX = W * 0.08 + i * (W * 0.17);
    const lpBaseY = pvY;
    const lpTopY = lpBaseY - 90;
    fg.push(line(lpX, lpBaseY, lpX, lpTopY, { width: 0.7, opacity: 0.92 }));
    // Cross arm
    fg.push(line(lpX - 18, lpTopY + 4, lpX + 18, lpTopY + 4, { width: 0.5, opacity: 0.85 }));
    // Light fixtures
    fg.push(rect(lpX - 22, lpTopY, 8, 4, { width: 0.4, opacity: 0.85 }));
    fg.push(rect(lpX + 14, lpTopY, 8, 4, { width: 0.4, opacity: 0.85 }));
    // Glow rays
    for (let r = 0; r < 5; r++) {
      const a = (r / 4) * Math.PI;
      fg.push(line(lpX - 18, lpTopY + 6, lpX - 18 + Math.cos(a) * 5, lpTopY + 6 + Math.sin(a) * 5, { width: 0.18, opacity: 0.4 }));
      fg.push(line(lpX + 18, lpTopY + 6, lpX + 18 + Math.cos(a) * 5, lpTopY + 6 + Math.sin(a) * 5, { width: 0.18, opacity: 0.4 }));
    }
    // Base
    fg.push(rect(lpX - 3, lpBaseY - 4, 6, 4, { width: 0.4, opacity: 0.85 }));
  }

  // Shuttle bus on left lane
  const busX = W * 0.18;
  const busY = pvY + 12;
  fg.push(rect(busX, busY, 60, 18, { width: 0.7, opacity: 0.92 }));
  // Windows
  for (let w = 0; w < 6; w++) {
    fg.push(rect(busX + 4 + w * 9, busY + 3, 7, 7, { width: 0.3, opacity: 0.7 }));
  }
  // Wheels
  fg.push(circle(busX + 12, busY + 18, 3.5, { width: 0.5, opacity: 0.92 }));
  fg.push(circle(busX + 48, busY + 18, 3.5, { width: 0.5, opacity: 0.92 }));
  // Door
  fg.push(rect(busX + 50, busY + 4, 6, 13, { width: 0.4, opacity: 0.7 }));

  // Taxi (right side)
  const txX = W * 0.65;
  const txY = pvY + 22;
  fg.push(path(
    `M ${txX},${txY + 8} L ${txX + 4},${txY} L ${txX + 24},${txY} L ${txX + 30},${txY + 4} L ${txX + 36},${txY + 8} L ${txX + 36},${txY + 12} L ${txX},${txY + 12} Z`,
    { width: 0.6, opacity: 0.92 },
  ));
  fg.push(circle(txX + 7, txY + 12, 2.5, { width: 0.5, opacity: 0.92 }));
  fg.push(circle(txX + 27, txY + 12, 2.5, { width: 0.5, opacity: 0.92 }));
  // Taxi sign on top
  fg.push(rect(txX + 14, txY - 3, 8, 3, { width: 0.3, opacity: 0.85 }));

  // Lane signage / overhead arrows
  const signY2 = pvY - 12;
  for (let i = 0; i < 3; i++) {
    const sx = W * 0.30 + i * (W * 0.20);
    fg.push(rect(sx, signY2, 50, 10, { width: 0.4, opacity: 0.8 }));
    // Arrow inside
    fg.push(path(`M ${sx + 15},${signY2 + 5} L ${sx + 35},${signY2 + 5} M ${sx + 30},${signY2 + 2} L ${sx + 35},${signY2 + 5} L ${sx + 30},${signY2 + 8}`, {
      width: 0.4, opacity: 0.7,
    }));
  }

  // Foreground ground hatching
  fg.push(hatch(0, pvBot, W, H - pvBot, 0, 5, { width: 0.18, opacity: 0.2 }));

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
