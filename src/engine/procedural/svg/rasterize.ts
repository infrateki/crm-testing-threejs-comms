/* SVG → Canvas rasterization + per-layer extraction for Three.js parallax.
   Includes a small in-memory cache keyed by SVG content + size to avoid
   repeated parsing/rendering when the same scene is requested multiple
   times across the session. */

import { svgWithOnlyLayer } from './helpers';
import type { LayerOutput } from '@/engine/ink-processor/types';

// ── Cache ────────────────────────────────────────────────────────────
const layerCache = new Map<string, LayerOutput[]>();
const canvasCache = new Map<string, HTMLCanvasElement>();
const MAX_CACHE = 24;

function cacheKey(svg: string, width: number, height: number, layer = 'composite'): string {
  // Hash the SVG content to keep cache key small
  let h = 0x9e3779b9;
  for (let i = 0; i < svg.length; i += 31) {
    h ^= svg.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return `${h.toString(16)}-${width}x${height}-${layer}`;
}

function evictIfFull<K, V>(map: Map<K, V>): void {
  while (map.size > MAX_CACHE) {
    const first = map.keys().next();
    if (first.done) break;
    map.delete(first.value);
  }
}

// ── Core rasterizer ─────────────────────────────────────────────────
export async function rasterizeSVG(
  svg: string,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const key = cacheKey(svg, width, height);
  const cached = canvasCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');

  ctx.fillStyle = '#FAF8F3';
  ctx.fillRect(0, 0, width, height);

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    ctx.drawImage(img, 0, 0, width, height);
  } finally {
    URL.revokeObjectURL(url);
  }

  canvasCache.set(key, canvas);
  evictIfFull(canvasCache);
  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('SVG image load failed'));
    img.src = src;
  });
}

// ── Layer rasterization ─────────────────────────────────────────────
const LAYER_SPECS = [
  { name: 'background', depth: 10, parallaxFactor: 0.3 },
  { name: 'midground',  depth: 5,  parallaxFactor: 0.8 },
  { name: 'foreground', depth: 1,  parallaxFactor: 1.5 },
] as const;

export async function rasterizeLayers(
  svg: string,
  width: number,
  height: number,
): Promise<LayerOutput[]> {
  const key = cacheKey(svg, width, height, 'layers');
  const cached = layerCache.get(key);
  if (cached) return cached;

  const out: LayerOutput[] = [];
  for (const spec of LAYER_SPECS) {
    const layerSVG = svgWithOnlyLayer(svg, spec.name);
    const canvas = await rasterizeSVG(layerSVG, width, height);
    out.push({
      name: spec.name,
      dataURL: canvas.toDataURL('image/png'),
      depth: spec.depth,
      parallaxFactor: spec.parallaxFactor,
    });
  }

  layerCache.set(key, out);
  evictIfFull(layerCache);
  return out;
}

// ── SVG → data URL (for direct <img>/SVG usage on mobile) ───────────
export function svgToDataURL(svg: string): string {
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}
