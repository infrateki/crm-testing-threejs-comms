import type { Opportunity } from '@/types/opportunity';
import { formatCurrency, formatDate } from './format';
import { getStatusLabel, getTierLabel } from './scoring';

export interface SVGExportConfig {
  width?: number;
  height?: number;
  paperColor?: string;
}

export async function exportAsPNG(
  canvas: HTMLCanvasElement,
  opportunity: Opportunity,
  scale = 2,
): Promise<string> {
  await document.fonts.ready;

  const srcW = canvas.width;
  const srcH = canvas.height;
  const outW = srcW * scale;
  const outH = srcH * scale;

  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('No 2d context for export');

  ctx.drawImage(canvas, 0, 0, outW, outH);

  ctx.save();
  ctx.scale(scale, scale);
  _drawTextOverlay(ctx, opportunity, srcW, srcH);
  ctx.restore();

  return out.toDataURL('image/png');
}

function _drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  opp: Opportunity,
  w: number,
  h: number,
): void {
  const gradH = 160;
  const grad = ctx.createLinearGradient(0, h - gradH, 0, h);
  grad.addColorStop(0, 'rgba(250,248,243,0)');
  grad.addColorStop(1, 'rgba(250,248,243,0.94)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h - gradH, w, gradH);

  ctx.save();
  ctx.textBaseline = 'alphabetic';

  ctx.font = '500 12px "DM Sans", system-ui, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(opp.agency.toUpperCase(), 20, h - 108);

  ctx.font = '900 24px "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#1a1a1a';
  const titleLines = _wrapText(ctx, opp.title, w - 40);
  titleLines.forEach((line, i) => ctx.fillText(line, 20, h - 80 + i * 28));

  const statParts: string[] = [
    formatCurrency(opp.value),
    getTierLabel(opp.tier),
    getStatusLabel(opp.status),
  ];
  if (opp.deadline) statParts.push(formatDate(opp.deadline));

  ctx.font = '400 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#9CA3AF';
  ctx.fillText(statParts.join('  ·  '), 20, h - 18);

  ctx.restore();
}

function _wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

export function exportAsSVG(
  illustrationDataURL: string,
  opportunity: Opportunity,
  config: SVGExportConfig = {},
): string {
  const { width = 1200, height = 800, paperColor = '#FAF8F3' } = config;
  const half = width / 2;

  const value = formatCurrency(opportunity.value);
  const statusLabel = getStatusLabel(opportunity.status);
  const tierLabel = getTierLabel(opportunity.tier);
  const dateStr = opportunity.deadline ? formatDate(opportunity.deadline) : '—';

  const title = _escapeXML(opportunity.title);
  const agency = _escapeXML(opportunity.agency.toUpperCase());

  const statsY = height - 80;
  const statItems = [
    { label: 'EST. VALUE', value },
    { label: 'STATUS', value: statusLabel },
    { label: 'TIER', value: tierLabel },
    { label: 'DEADLINE', value: dateStr },
  ];
  const statSpacing = (half - 80) / statItems.length;

  const statEls = statItems
    .map(
      (s, i) => `
  <text x="${half + 40 + i * statSpacing}" y="${statsY + 34}"
    font-family="&quot;JetBrains Mono&quot;, monospace" font-size="18" font-weight="700" fill="#1a1a1a">${_escapeXML(s.value)}</text>
  <text x="${half + 40 + i * statSpacing}" y="${statsY + 54}"
    font-family="&quot;DM Sans&quot;, sans-serif" font-size="11" font-weight="400" fill="#9CA3AF" letter-spacing="0.04em">${_escapeXML(s.label)}</text>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${paperColor}"/>
  <image href="${illustrationDataURL}" x="0" y="0" width="${half}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${half}" y="0" width="${half}" height="${height}" fill="${paperColor}"/>
  <line x1="${half}" y1="0" x2="${half}" y2="${height}" stroke="#E5E7EB" stroke-width="1"/>
  <text x="${half + 40}" y="80"
    font-family="&quot;DM Sans&quot;, system-ui, sans-serif" font-size="12" font-weight="500"
    fill="#6B7280" letter-spacing="0.08em">${agency}</text>
  <text x="${half + 40}" y="124"
    font-family="&quot;Playfair Display&quot;, Georgia, serif" font-size="36" font-weight="900"
    fill="#1a1a1a" letter-spacing="-0.02em">${title}</text>
  <rect x="${half}" y="${statsY}" width="${half}" height="80" fill="#FAFAFA"/>
  <line x1="${half}" y1="${statsY}" x2="${width}" y2="${statsY}" stroke="#E5E7EB" stroke-width="1"/>
  ${statEls}
  <text x="${width - 16}" y="${height - 10}"
    font-family="&quot;DM Sans&quot;, sans-serif" font-size="10" font-weight="400"
    fill="#9CA3AF" text-anchor="end">BIMSEARCH · PDBM Consulting</text>
</svg>`;
}

function _escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadFile(dataURL: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function svgToObjectURL(svg: string): string {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(blob);
}
