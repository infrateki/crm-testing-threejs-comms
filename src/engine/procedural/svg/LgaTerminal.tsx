/* LGA — LaGuardia / NYC scene: angular modern terminal + skyline backdrop */
import {
  line, rect, path, hatch, deciduousTree, bird, cumulus, cloud,
  group, svgDocument, seedRandom, building, windowGrid, circle,
} from './helpers';

export interface SceneOpts {
  width?: number;
  height?: number;
  seed?: number;
}

export function generateLgaTerminal({ width = 1600, height = 900, seed = 7777 }: SceneOpts = {}): string {
  const W = width, H = height;
  const horizon = H * 0.58;
  const rng = seedRandom(seed);

  // ╭──────────────────────────────────────────────────╮
  // │ BACKGROUND — NYC skyline, atmosphere, birds
  // ╰──────────────────────────────────────────────────╯
  const bg: string[] = [];

  // Wispy cloud strokes
  for (let i = 0; i < 6; i++) {
    bg.push(cloud(140 + i * 240 + rng() * 60, H * 0.10 + rng() * 60, 1.2 + rng() * 0.6, rng));
  }
  bg.push(cumulus(W * 0.32, H * 0.12, 1.4, rng));
  bg.push(cumulus(W * 0.70, H * 0.16, 1.6, rng));

  // Distant skyline — 14 buildings of varying heights with detailed window grids
  // Use atmospheric perspective: thinner strokes, lower opacity
  const skylineBaseY = horizon - 4;
  const skyBuildings: { x: number; w: number; h: number; cols: number; rows: number; rooftop: 'flat' | 'water-tower' | 'antenna' | 'spire' | 'dome' }[] = [
    { x: W * 0.02, w: 70, h: 80, cols: 6, rows: 5, rooftop: 'flat' },
    { x: W * 0.07, w: 55, h: 110, cols: 5, rows: 8, rooftop: 'water-tower' },
    { x: W * 0.12, w: 80, h: 140, cols: 7, rows: 10, rooftop: 'antenna' },
    { x: W * 0.18, w: 65, h: 200, cols: 6, rows: 14, rooftop: 'spire' }, // Empire State-ish
    { x: W * 0.24, w: 90, h: 130, cols: 8, rows: 9, rooftop: 'water-tower' },
    { x: W * 0.31, w: 70, h: 165, cols: 6, rows: 12, rooftop: 'spire' }, // Chrysler-ish
    { x: W * 0.37, w: 60, h: 95, cols: 5, rows: 7, rooftop: 'flat' },
    { x: W * 0.42, w: 85, h: 175, cols: 7, rows: 13, rooftop: 'antenna' },
    { x: W * 0.49, w: 55, h: 100, cols: 5, rows: 7, rooftop: 'water-tower' },
    { x: W * 0.54, w: 75, h: 145, cols: 7, rows: 10, rooftop: 'flat' },
    { x: W * 0.60, w: 60, h: 115, cols: 5, rows: 8, rooftop: 'antenna' },
    { x: W * 0.66, w: 95, h: 185, cols: 8, rows: 14, rooftop: 'spire' },
    { x: W * 0.73, w: 70, h: 130, cols: 6, rows: 9, rooftop: 'water-tower' },
    { x: W * 0.79, w: 55, h: 95, cols: 5, rows: 7, rooftop: 'flat' },
    { x: W * 0.84, w: 80, h: 160, cols: 7, rows: 12, rooftop: 'antenna' },
    { x: W * 0.91, w: 60, h: 105, cols: 5, rows: 8, rooftop: 'flat' },
  ];
  for (const b of skyBuildings) {
    bg.push(building(b.x, skylineBaseY, b.w, b.h, {
      cols: b.cols,
      rows: b.rows,
      opacity: 0.45,
      strokeWidth: 0.32,
      rooftop: b.rooftop,
    }));
  }

  // Atmospheric haze
  bg.push(hatch(0, horizon - 6, W, 14, 0, 5, { width: 0.18, opacity: 0.18 }));

  // Birds in detailed flying poses (varied sizes)
  bg.push(bird(W * 0.20, H * 0.25, 18, 'detailed'));
  bg.push(bird(W * 0.32, H * 0.20, 12, 'detailed'));
  bg.push(bird(W * 0.45, H * 0.30, 9, 'v'));
  bg.push(bird(W * 0.58, H * 0.18, 14, 'detailed'));
  bg.push(bird(W * 0.72, H * 0.26, 10, 'v'));
  bg.push(bird(W * 0.84, H * 0.22, 8, 'v'));

  // Subtle horizon ground line
  bg.push(line(0, horizon, W, horizon, { width: 0.5, opacity: 0.45 }));

  // ╭──────────────────────────────────────────────────╮
  // │ MIDGROUND — modern angular terminal building
  // ╰──────────────────────────────────────────────────╯
  const mg: string[] = [];

  const termL = W * 0.08;
  const termR = W * 0.92;
  const termW = termR - termL;
  const baseY = H * 0.78;
  const topY = H * 0.42;
  // Cantilevered roof — angular asymmetric
  const roofY = topY;
  const roofPeakX = termL + termW * 0.65;
  mg.push(path(
    `M ${termL - 30},${roofY + 14} L ${termL + termW * 0.32},${roofY - 16} L ${roofPeakX},${roofY - 20} L ${termR + 36},${roofY + 8}`,
    { width: 1.4, opacity: 0.95 },
  ));
  // Roof thickness
  mg.push(path(
    `M ${termL - 28},${roofY + 22} L ${termL + termW * 0.32},${roofY - 8} L ${roofPeakX},${roofY - 12} L ${termR + 34},${roofY + 16}`,
    { width: 0.6, opacity: 0.65 },
  ));
  // Roof cantilever support struts
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const rx = termL + termW * t;
    const ry = roofY + 14 + Math.abs(t - 0.65) * 10 - 4;
    mg.push(line(rx, ry + 8, rx, roofY + 30, { width: 0.4, opacity: 0.65 }));
  }

  // Glass facade with mullion grid (100+ rectangles for windows)
  const facadeTop = roofY + 22;
  const facadeH = baseY - facadeTop;
  const facadeCols = 28;
  const facadeRows = 6;
  // Outer frame
  mg.push(rect(termL, facadeTop, termW, facadeH, { width: 0.8, opacity: 0.9 }));
  // Detailed window grid
  mg.push(windowGrid(termL + 2, facadeTop + 2, termW - 4, facadeH - 4, facadeCols, facadeRows, {
    mullionWidth: 0.32, opacity: 0.78, jitter: rng,
  }));

  // Exposed steel structural columns (visible)
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const cx = termL + termW * t;
    mg.push(line(cx, facadeTop, cx, baseY, { width: 1.0, opacity: 0.78 }));
    // Diagonal X bracing in select bays
    if (i % 2 === 1 && i < 6) {
      const nextX = termL + termW * ((i + 1) / 6);
      mg.push(line(cx, facadeTop + 30, nextX, facadeTop + facadeH * 0.45, { width: 0.45, opacity: 0.55 }));
      mg.push(line(nextX, facadeTop + 30, cx, facadeTop + facadeH * 0.45, { width: 0.45, opacity: 0.55 }));
    }
  }

  // Pedestrian bridge crossing on right
  const pbY = facadeTop + facadeH * 0.55;
  mg.push(rect(termR + 4, pbY, 80, 16, { width: 0.6, opacity: 0.8 }));
  // Bridge support
  mg.push(line(termR + 84, pbY + 16, termR + 84, baseY, { width: 0.7, opacity: 0.78 }));
  // Bridge windows
  for (let w = 0; w < 8; w++) {
    mg.push(rect(termR + 8 + w * 9, pbY + 3, 7, 10, { width: 0.25, opacity: 0.65 }));
  }

  // Building shadow hatching beneath canopy
  mg.push(hatch(termL, facadeTop, termW, 16, 45, 2.5, { width: 0.25, opacity: 0.45 }));

  // Signage strip
  mg.push(rect(termL + termW * 0.42, facadeTop + 10, termW * 0.16, 18, { width: 0.5, opacity: 0.8 }));
  mg.push(line(termL + termW * 0.46, facadeTop + 19, termL + termW * 0.54, facadeTop + 19, { width: 0.3, opacity: 0.6 }));

  // Building base / plaza
  mg.push(rect(termL - 20, baseY, termW + 40, 16, { width: 0.6, opacity: 0.7 }));
  // Plaza floor pattern
  for (let i = 0; i < 14; i++) {
    const px = termL - 20 + i * ((termW + 40) / 14);
    mg.push(line(px, baseY, px, baseY + 16, { width: 0.2, opacity: 0.4 }));
  }

  // Hatching on building face for depth
  mg.push(hatch(termL, facadeTop + facadeH * 0.7, termW * 0.3, facadeH * 0.3, 30, 1.8, { width: 0.18, opacity: 0.25 }));

  // ╭──────────────────────────────────────────────────╮
  // │ FOREGROUND — street-level trees, bench, bollards, sidewalk
  // ╰──────────────────────────────────────────────────╯
  const fg: string[] = [];

  // Sidewalk
  const swY = H * 0.86;
  fg.push(line(0, swY, W, swY, { width: 1.0, opacity: 0.85 }));
  fg.push(line(0, H * 0.94, W, H * 0.94, { width: 0.5, opacity: 0.7 }));
  // Sidewalk panel divisions
  for (let i = 0; i < 30; i++) {
    const cx = (i / 30) * W;
    fg.push(line(cx, swY, cx, H * 0.94, { width: 0.25, opacity: 0.4 }));
  }

  // Curb shadow hatch
  fg.push(hatch(0, swY, W, 4, 0, 3, { width: 0.18, opacity: 0.3 }));

  // Detailed deciduous trees (3 large)
  fg.push(deciduousTree(W * 0.10, swY, 1.7, rng));
  fg.push(deciduousTree(W * 0.86, swY, 1.6, rng));
  fg.push(deciduousTree(W * 0.42, swY + 4, 1.0, rng));

  // Bollards lining sidewalk
  for (let i = 0; i < 8; i++) {
    const bx = W * 0.18 + i * (W * 0.085);
    fg.push(rect(bx - 2, swY - 7, 4, 7, { width: 0.5, opacity: 0.85 }));
    fg.push(circle(bx, swY - 7, 2.5, { width: 0.4, opacity: 0.85 }));
  }

  // Park bench
  const benchX = W * 0.62;
  const benchY = swY - 2;
  fg.push(line(benchX, benchY, benchX + 50, benchY, { width: 0.7, opacity: 0.9 }));
  fg.push(line(benchX, benchY - 4, benchX + 50, benchY - 4, { width: 0.5, opacity: 0.75 }));
  // Bench legs
  fg.push(line(benchX + 4, benchY - 4, benchX + 4, benchY + 12, { width: 0.5, opacity: 0.85 }));
  fg.push(line(benchX + 24, benchY - 4, benchX + 24, benchY + 12, { width: 0.5, opacity: 0.85 }));
  fg.push(line(benchX + 46, benchY - 4, benchX + 46, benchY + 12, { width: 0.5, opacity: 0.85 }));
  // Bench backrest slats
  for (let i = 0; i < 5; i++) {
    fg.push(line(benchX + 6 + i * 9, benchY - 14, benchX + 6 + i * 9, benchY - 4, { width: 0.4, opacity: 0.7 }));
  }

  // Street lamp
  const lampX = W * 0.33;
  fg.push(line(lampX, swY, lampX, swY - 70, { width: 0.7, opacity: 0.9 }));
  fg.push(path(`M ${lampX},${swY - 70} q 10,-2 14,-8`, { width: 0.6, opacity: 0.85 }));
  fg.push(rect(lampX + 12, swY - 80, 8, 6, { width: 0.5, opacity: 0.85 }));
  // Glow lines
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI;
    fg.push(line(lampX + 16, swY - 76, lampX + 16 + Math.cos(a) * 7, swY - 76 + Math.sin(a) * 7, { width: 0.2, opacity: 0.4 }));
  }

  // Newspaper vending box
  const npX = W * 0.50;
  fg.push(rect(npX, swY - 14, 14, 14, { width: 0.5, opacity: 0.85 }));
  fg.push(line(npX + 7, swY - 14, npX + 7, swY, { width: 0.3, opacity: 0.6 }));
  fg.push(line(npX, swY - 7, npX + 14, swY - 7, { width: 0.3, opacity: 0.6 }));

  // Tiny figures (2 distant pedestrians) for scale
  const figs: [number, number][] = [[W * 0.25, swY - 12], [W * 0.74, swY - 10]];
  for (const [fx, fy] of figs) {
    fg.push(circle(fx, fy - 4, 1.5, { width: 0.4, fill: '#1a1a1a', opacity: 0.85 }));
    fg.push(line(fx, fy - 2, fx, fy + 4, { width: 0.5, opacity: 0.85 }));
    fg.push(line(fx, fy + 4, fx - 1.5, fy + 8, { width: 0.4, opacity: 0.85 }));
    fg.push(line(fx, fy + 4, fx + 1.5, fy + 8, { width: 0.4, opacity: 0.85 }));
  }

  // Foreground ground hatching
  fg.push(hatch(0, H * 0.94, W, H * 0.06, 0, 5, { width: 0.18, opacity: 0.22 }));

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
