/* ────────────────────────────────────────────────────────────
   SVG Primitive Generators — Titan/Arcus ink-architectural style
   All output is plain SVG markup strings.
   Color: #1a1a1a only. Background: #FAF8F3.
   ──────────────────────────────────────────────────────────── */

export const INK = '#1a1a1a';
export const PAPER = '#FAF8F3';

// ── Deterministic randomness for hand-drawn jitter ──────────────────
export function seedRandom(seed: number): () => number {
  let s = (seed | 0) || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function wobble(rng: () => number, v: number, amt = 0.5): number {
  return v + (rng() - 0.5) * amt * 2;
}

export function rng2(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

// ── Path primitives ─────────────────────────────────────────────────
export interface StrokeOpts {
  width?: number;
  opacity?: number;
  fill?: string;
  cap?: 'round' | 'butt' | 'square';
  join?: 'round' | 'miter' | 'bevel';
  dasharray?: string;
}

function strokeAttrs(o: StrokeOpts = {}): string {
  return [
    `stroke="${INK}"`,
    `stroke-width="${o.width ?? 0.8}"`,
    o.opacity != null ? `stroke-opacity="${o.opacity}"` : '',
    `fill="${o.fill ?? 'none'}"`,
    o.cap ? `stroke-linecap="${o.cap}"` : 'stroke-linecap="round"',
    o.join ? `stroke-linejoin="${o.join}"` : 'stroke-linejoin="round"',
    o.dasharray ? `stroke-dasharray="${o.dasharray}"` : '',
  ].filter(Boolean).join(' ');
}

export function line(x1: number, y1: number, x2: number, y2: number, o?: StrokeOpts): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" ${strokeAttrs(o)}/>`;
}

export function rect(x: number, y: number, w: number, h: number, o?: StrokeOpts): string {
  return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ${strokeAttrs(o)}/>`;
}

export function path(d: string, o?: StrokeOpts): string {
  return `<path d="${d}" ${strokeAttrs(o)}/>`;
}

export function circle(cx: number, cy: number, r: number, o?: StrokeOpts): string {
  return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" ${strokeAttrs(o)}/>`;
}

export function polyline(points: [number, number][], o?: StrokeOpts): string {
  const pts = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  return `<polyline points="${pts}" ${strokeAttrs(o)}/>`;
}

// ── Cross-hatching ──────────────────────────────────────────────────
export function hatch(
  x: number, y: number, w: number, h: number,
  angleDeg: number, spacing: number,
  opts: { width?: number; opacity?: number } = {},
): string {
  const width = opts.width ?? 0.3;
  const opacity = opts.opacity ?? 0.55;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  // Project corners onto perpendicular direction to find scanline range
  const nx = -dy;
  const ny = dx;
  const corners: [number, number][] = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
  const projs = corners.map(([cx, cy]) => cx * nx + cy * ny);
  const pMin = Math.min(...projs);
  const pMax = Math.max(...projs);
  const lines: string[] = [];
  const clipId = `hatch-${Math.random().toString(36).slice(2, 8)}`;
  const out: string[] = [
    `<defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>`,
    `<g clip-path="url(#${clipId})">`,
  ];
  const len = Math.hypot(w, h) * 1.5;
  for (let p = pMin; p <= pMax; p += spacing) {
    // Anchor on perpendicular line at distance p, then extend ±len in direction (dx,dy)
    const ax = nx * p;
    const ay = ny * p;
    const x1 = ax - dx * len;
    const y1 = ay - dy * len;
    const x2 = ax + dx * len;
    const y2 = ay + dy * len;
    lines.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${INK}" stroke-width="${width}" stroke-opacity="${opacity}" stroke-linecap="butt"/>`);
  }
  out.push(...lines, `</g>`);
  return out.join('');
}

// ── Window grid (curtain wall) ──────────────────────────────────────
export function windowGrid(
  x: number, y: number, w: number, h: number,
  cols: number, rows: number,
  opts: { mullionWidth?: number; opacity?: number; jitter?: () => number; sillRatio?: number } = {},
): string {
  const out: string[] = [];
  const cw = w / cols;
  const rh = h / rows;
  const mw = opts.mullionWidth ?? 0.4;
  const op = opts.opacity ?? 0.85;
  const j = opts.jitter ?? (() => 0);
  // Outer frame
  out.push(rect(x, y, w, h, { width: mw * 1.6, opacity: op }));
  // Vertical mullions
  for (let c = 1; c < cols; c++) {
    const cx = x + c * cw + (j() - 0.5);
    out.push(line(cx, y, cx, y + h, { width: mw, opacity: op }));
  }
  // Horizontal mullions
  for (let r = 1; r < rows; r++) {
    const ry = y + r * rh + (j() - 0.5);
    out.push(line(x, ry, x + w, ry, { width: mw, opacity: op }));
  }
  // Random shaded windows (10–18% darkened with hatching)
  const shadeCount = Math.floor(cols * rows * 0.15);
  for (let i = 0; i < shadeCount; i++) {
    const cc = Math.floor(j() * cols + cols / 2) % cols;
    const rr = Math.floor((j() + 0.5) * rows + rows / 2) % rows;
    out.push(hatch(x + cc * cw + 1, y + rr * rh + 1, cw - 2, rh - 2, 45, 1.4, { width: 0.2, opacity: 0.4 }));
  }
  return out.join('');
}

// ── Building silhouette with windows ────────────────────────────────
export function building(
  x: number, baseY: number, w: number, hgt: number,
  opts: {
    cols?: number;
    rows?: number;
    rooftop?: 'flat' | 'water-tower' | 'antenna' | 'dome' | 'spire';
    opacity?: number;
    strokeWidth?: number;
  } = {},
): string {
  const cols = opts.cols ?? Math.max(2, Math.floor(w / 12));
  const rows = opts.rows ?? Math.max(3, Math.floor(hgt / 14));
  const op = opts.opacity ?? 0.85;
  const sw = opts.strokeWidth ?? 0.7;
  const out: string[] = [];
  const top = baseY - hgt;
  // Building footprint
  out.push(rect(x, top, w, hgt, { width: sw, opacity: op }));
  // Inner window grid (inset)
  const inset = 3;
  out.push(windowGrid(x + inset, top + inset, w - inset * 2, hgt - inset * 2 - 4, cols, rows, { mullionWidth: 0.35, opacity: op * 0.85 }));
  // Rooftop accessory
  switch (opts.rooftop) {
    case 'water-tower': {
      const tx = x + w * 0.62;
      const tw = Math.min(14, w * 0.18);
      const tg = top - 14;
      out.push(rect(tx, tg, tw, 9, { width: sw, opacity: op }));
      out.push(line(tx + 2, tg + 9, tx + 2, tg + 14, { width: sw, opacity: op }));
      out.push(line(tx + tw - 2, tg + 9, tx + tw - 2, tg + 14, { width: sw, opacity: op }));
      out.push(line(tx, tg, tx + tw / 2, tg - 5, { width: sw, opacity: op }));
      out.push(line(tx + tw, tg, tx + tw / 2, tg - 5, { width: sw, opacity: op }));
      break;
    }
    case 'antenna': {
      const ax = x + w * 0.5;
      out.push(line(ax, top, ax, top - 22, { width: 0.5, opacity: op }));
      out.push(line(ax - 4, top - 16, ax + 4, top - 16, { width: 0.4, opacity: op }));
      out.push(line(ax - 3, top - 11, ax + 3, top - 11, { width: 0.4, opacity: op }));
      break;
    }
    case 'spire': {
      const sx = x + w * 0.5;
      out.push(line(sx, top, sx, top - 28, { width: 0.6, opacity: op }));
      out.push(line(sx - 3, top - 6, sx, top, { width: 0.5, opacity: op }));
      out.push(line(sx + 3, top - 6, sx, top, { width: 0.5, opacity: op }));
      break;
    }
    case 'dome': {
      const cx = x + w * 0.5;
      const r = w * 0.18;
      out.push(path(`M ${cx - r},${top} A ${r},${r * 0.6} 0 0 1 ${cx + r},${top}`, { width: sw, opacity: op }));
      break;
    }
  }
  return out.join('');
}

// ── Palm tree with bezier-curved fronds ─────────────────────────────
export function palmTree(
  cx: number, baseY: number, scale: number,
  rng: () => number,
): string {
  const out: string[] = [];
  const trunkH = 70 * scale;
  const trunkTop = baseY - trunkH;
  const trunkW = 4.5 * scale;

  // Trunk — slightly curved with bark texture
  const ctrlX = cx + (rng() - 0.5) * 4 * scale;
  out.push(path(
    `M ${cx - trunkW / 2},${baseY} Q ${ctrlX - trunkW / 2},${baseY - trunkH / 2} ${cx - trunkW / 4},${trunkTop}`,
    { width: 1.2 * scale, opacity: 0.95 },
  ));
  out.push(path(
    `M ${cx + trunkW / 2},${baseY} Q ${ctrlX + trunkW / 2},${baseY - trunkH / 2} ${cx + trunkW / 4},${trunkTop}`,
    { width: 1.2 * scale, opacity: 0.95 },
  ));
  // Bark rings
  const ringCount = Math.floor(8 * scale);
  for (let i = 1; i < ringCount; i++) {
    const t = i / ringCount;
    const ringY = baseY - trunkH * t;
    const ringX = cx + (ctrlX - cx) * t * 0.9 - trunkW * 0.4;
    const wid = trunkW * (0.85 + (rng() - 0.5) * 0.2);
    out.push(path(`M ${ringX},${ringY} q ${wid / 2},${(rng() - 0.5) * 1.5} ${wid},0`, {
      width: 0.3 * scale, opacity: 0.5,
    }));
  }

  // Fronds — 7 to 11 large arching leaves
  const frondCount = 8 + Math.floor(rng() * 4);
  const palmTop = trunkTop + (rng() - 0.5) * 3;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2 + (rng() - 0.5) * 0.3;
    const len = (28 + rng() * 18) * scale;
    const droop = 0.45 + rng() * 0.5;
    // Bezier control: extend outward then droop down
    const tipX = cx + Math.cos(angle) * len;
    const tipY = palmTop + Math.sin(angle) * len * droop;
    const ctrl1X = cx + Math.cos(angle) * len * 0.4;
    const ctrl1Y = palmTop + Math.sin(angle) * len * 0.2;
    const ctrl2X = cx + Math.cos(angle) * len * 0.85;
    const ctrl2Y = palmTop + Math.sin(angle) * len * (droop * 0.6);
    out.push(path(
      `M ${cx},${palmTop} C ${ctrl1X.toFixed(1)},${ctrl1Y.toFixed(1)} ${ctrl2X.toFixed(1)},${ctrl2Y.toFixed(1)} ${tipX.toFixed(1)},${tipY.toFixed(1)}`,
      { width: 0.9 * scale, opacity: 0.92 },
    ));
    // Fine leaflets along frond — perpendicular barbs
    const barbCount = Math.floor(8 + rng() * 6);
    for (let b = 1; b < barbCount; b++) {
      const t = b / barbCount;
      const px = cx + (tipX - cx) * t;
      const py = palmTop + (tipY - palmTop) * t * (1 + t * 0.3);
      const perp = angle + Math.PI / 2;
      const barbLen = (4 + rng() * 3) * scale * (1 - t * 0.4);
      const bx1 = px + Math.cos(perp) * barbLen * 0.3;
      const by1 = py + Math.sin(perp) * barbLen * 0.3;
      const bx2 = px - Math.cos(perp) * barbLen;
      const by2 = py - Math.sin(perp) * barbLen;
      out.push(line(bx1, by1, bx2, by2, { width: 0.35 * scale, opacity: 0.7 }));
    }
  }

  // Coconut cluster (small dark dots near top)
  const cocoCount = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < cocoCount; i++) {
    const cocoX = cx + (rng() - 0.5) * 6 * scale;
    const cocoY = palmTop + 2 + (rng() - 0.5) * 3 * scale;
    out.push(circle(cocoX, cocoY, 1.3 * scale, { width: 0.4 * scale, fill: INK, opacity: 0.85 }));
  }

  return out.join('');
}

// ── Deciduous tree (NYC style) ──────────────────────────────────────
export function deciduousTree(
  cx: number, baseY: number, scale: number,
  rng: () => number,
): string {
  const out: string[] = [];
  const trunkH = 35 * scale;
  const trunkTop = baseY - trunkH;
  // Trunk
  out.push(line(cx, baseY, cx, trunkTop, { width: 1.6 * scale, opacity: 0.95 }));
  // Branch structure
  const branches: { x: number; y: number; angle: number; len: number; depth: number }[] = [
    { x: cx, y: trunkTop, angle: -Math.PI / 2, len: 14 * scale, depth: 0 },
  ];
  const allBranches: typeof branches = [];
  while (branches.length > 0) {
    const b = branches.shift()!;
    allBranches.push(b);
    if (b.depth >= 3 || b.len < 4 * scale) continue;
    const splits = b.depth === 0 ? 4 : 2 + Math.floor(rng() * 2);
    for (let i = 0; i < splits; i++) {
      const da = (rng() - 0.5) * 1.4;
      const newAngle = b.angle + da;
      const newLen = b.len * (0.55 + rng() * 0.2);
      const ex = b.x + Math.cos(b.angle) * b.len;
      const ey = b.y + Math.sin(b.angle) * b.len;
      branches.push({ x: ex, y: ey, angle: newAngle, len: newLen, depth: b.depth + 1 });
    }
  }
  for (const b of allBranches) {
    const ex = b.x + Math.cos(b.angle) * b.len;
    const ey = b.y + Math.sin(b.angle) * b.len;
    const wid = (1.4 - b.depth * 0.35) * scale;
    out.push(line(b.x, b.y, ex, ey, { width: Math.max(0.3, wid), opacity: 0.9 }));
  }
  // Foliage as dense curved hatch masses around branch tips
  for (const b of allBranches.filter((b) => b.depth >= 2)) {
    const ex = b.x + Math.cos(b.angle) * b.len;
    const ey = b.y + Math.sin(b.angle) * b.len;
    const radius = (5 + rng() * 4) * scale;
    const swatchCount = 8;
    for (let i = 0; i < swatchCount; i++) {
      const a = rng() * Math.PI * 2;
      const r = rng() * radius;
      const px = ex + Math.cos(a) * r;
      const py = ey + Math.sin(a) * r;
      const sw = (2 + rng() * 3) * scale;
      out.push(path(`M ${px},${py} q ${(rng() - 0.5) * sw},${-sw * 0.5} ${sw * 0.6},${(rng() - 0.5) * sw}`, {
        width: 0.3 * scale, opacity: 0.6,
      }));
    }
  }
  return out.join('');
}

// ── Bird (V or detailed flying pose) ────────────────────────────────
export function bird(
  cx: number, cy: number, size: number, style: 'v' | 'detailed' = 'detailed',
): string {
  if (style === 'v') {
    const w = size;
    return [
      path(`M ${cx - w},${cy + w * 0.2} Q ${cx - w * 0.5},${cy - w * 0.4} ${cx},${cy}`, { width: 0.6, opacity: 0.85 }),
      path(`M ${cx + w},${cy + w * 0.2} Q ${cx + w * 0.5},${cy - w * 0.4} ${cx},${cy}`, { width: 0.6, opacity: 0.85 }),
    ].join('');
  }
  const w = size;
  // Body
  const out: string[] = [];
  out.push(path(`M ${cx - w * 0.15},${cy} Q ${cx},${cy - w * 0.1} ${cx + w * 0.15},${cy} Q ${cx},${cy + w * 0.05} ${cx - w * 0.15},${cy}`, {
    width: 0.5, fill: INK, opacity: 0.9,
  }));
  // Left wing — extended with primary feathers
  out.push(path(`M ${cx - w * 0.1},${cy - w * 0.05} Q ${cx - w * 0.5},${cy - w * 0.4} ${cx - w * 0.95},${cy - w * 0.15} Q ${cx - w * 0.6},${cy - w * 0.1} ${cx - w * 0.15},${cy + w * 0.02}`, {
    width: 0.5, fill: INK, opacity: 0.85,
  }));
  // Right wing
  out.push(path(`M ${cx + w * 0.1},${cy - w * 0.05} Q ${cx + w * 0.5},${cy - w * 0.4} ${cx + w * 0.95},${cy - w * 0.15} Q ${cx + w * 0.6},${cy - w * 0.1} ${cx + w * 0.15},${cy + w * 0.02}`, {
    width: 0.5, fill: INK, opacity: 0.85,
  }));
  // Tail
  out.push(line(cx + w * 0.12, cy + w * 0.02, cx + w * 0.25, cy + w * 0.1, { width: 0.4, opacity: 0.85 }));
  // Beak
  out.push(line(cx + w * 0.15, cy, cx + w * 0.22, cy - w * 0.02, { width: 0.4, opacity: 0.85 }));
  return out.join('');
}

// ── Wispy cloud ─────────────────────────────────────────────────────
export function cloud(cx: number, cy: number, scale: number, rng: () => number): string {
  const out: string[] = [];
  const segments = 5 + Math.floor(rng() * 4);
  for (let i = 0; i < segments; i++) {
    const dx = (i - segments / 2) * 8 * scale + (rng() - 0.5) * 4;
    const dy = (rng() - 0.5) * 3 * scale;
    const w = (10 + rng() * 8) * scale;
    out.push(path(
      `M ${cx + dx},${cy + dy} q ${w * 0.3},${-w * 0.15} ${w * 0.7},0 q ${-w * 0.1},${w * 0.05} ${-w * 0.5},0`,
      { width: 0.4 * scale, opacity: 0.45 },
    ));
  }
  return out.join('');
}

// ── Cumulus cloud (more substantial outline) ────────────────────────
export function cumulus(cx: number, cy: number, scale: number, rng: () => number): string {
  const lobes = 5 + Math.floor(rng() * 3);
  let d = `M ${cx - 18 * scale},${cy + 4 * scale}`;
  for (let i = 0; i < lobes; i++) {
    const t = i / (lobes - 1);
    const px = cx + (t - 0.5) * 36 * scale;
    const py = cy - (8 + rng() * 6) * scale;
    const cpx = px - 6 * scale;
    const cpy = py - 4 * scale;
    d += ` Q ${cpx.toFixed(1)},${cpy.toFixed(1)} ${px.toFixed(1)},${py.toFixed(1)}`;
  }
  d += ` Q ${cx + 16 * scale},${cy + 6 * scale} ${cx - 18 * scale},${cy + 4 * scale}`;
  return path(d, { width: 0.5 * scale, opacity: 0.55 });
}

// ── Aircraft silhouette ─────────────────────────────────────────────
export function aircraft(cx: number, cy: number, scale: number, facing: 'left' | 'right' = 'left'): string {
  const dir = facing === 'left' ? -1 : 1;
  const out: string[] = [];
  // Fuselage
  out.push(path(
    `M ${cx - 22 * scale * dir},${cy} Q ${cx},${cy - 3 * scale} ${cx + 18 * scale * dir},${cy + 1 * scale} L ${cx + 22 * scale * dir},${cy + 0.5 * scale} L ${cx + 18 * scale * dir},${cy + 1.8 * scale} Q ${cx},${cy + 4 * scale} ${cx - 22 * scale * dir},${cy}`,
    { width: 0.6, fill: INK, opacity: 0.92 },
  ));
  // Wings
  out.push(path(
    `M ${cx - 4 * scale * dir},${cy + 1 * scale} L ${cx + 8 * scale * dir},${cy + 8 * scale} L ${cx + 14 * scale * dir},${cy + 8 * scale} L ${cx + 4 * scale * dir},${cy + 2 * scale} Z`,
    { width: 0.4, fill: INK, opacity: 0.88 },
  ));
  // Tail
  out.push(path(
    `M ${cx + 16 * scale * dir},${cy} L ${cx + 22 * scale * dir},${cy - 5 * scale} L ${cx + 22 * scale * dir},${cy - 0.5 * scale} Z`,
    { width: 0.4, fill: INK, opacity: 0.88 },
  ));
  return out.join('');
}

// ── Group wrapper ───────────────────────────────────────────────────
export function group(
  layer: 'background' | 'midground' | 'foreground',
  opacity: number,
  contents: string,
): string {
  return `<g data-layer="${layer}" opacity="${opacity}">${contents}</g>`;
}

// ── SVG document wrapper ────────────────────────────────────────────
export function svgDocument(
  width: number, height: number, contents: string,
  options: { hideLayer?: 'background' | 'midground' | 'foreground' | null } = {},
): string {
  const styleCSS = options.hideLayer
    ? `<style>g[data-layer="${options.hideLayer}"]{display:none;}</style>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice">
<rect width="${width}" height="${height}" fill="${PAPER}"/>
${styleCSS}
${contents}
</svg>`;
}

// ── Extract specific layer (returns new SVG with only that layer visible) ──
export function svgWithOnlyLayer(
  fullSvg: string,
  layerName: 'background' | 'midground' | 'foreground',
): string {
  const others = (['background', 'midground', 'foreground'] as const).filter((l) => l !== layerName);
  const css = `<style>${others.map((l) => `g[data-layer="${l}"]{display:none;}`).join('')}</style>`;
  // Insert style after opening <svg> tag
  return fullSvg.replace(/(<svg[^>]*>)/, `$1${css}`);
}
