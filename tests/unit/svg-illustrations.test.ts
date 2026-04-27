import { describe, it, expect } from 'vitest';
import { generateMiaTerminal } from '@/engine/procedural/svg/MiaTerminal';
import { generateLgaTerminal } from '@/engine/procedural/svg/LgaTerminal';
import { generateDfwTerminal } from '@/engine/procedural/svg/DfwTerminal';
import { generateMcoTerminal } from '@/engine/procedural/svg/McoTerminal';
import { generateFederalBuilding } from '@/engine/procedural/svg/FederalBuilding';
import { resolveSceneKey, generateSceneFromTag } from '@/engine/procedural/svg/registry';

function countElements(svg: string): { paths: number; lines: number; rects: number; circles: number; total: number } {
  const paths = (svg.match(/<path /g) || []).length;
  const lines = (svg.match(/<line /g) || []).length;
  const rects = (svg.match(/<rect /g) || []).length;
  const circles = (svg.match(/<circle /g) || []).length;
  return { paths, lines, rects, circles, total: paths + lines + rects + circles };
}

describe('SVG Illustration quality bar', () => {
  const QUALITY_BAR = 200;

  it('MIA terminal exceeds 200 path elements', () => {
    const svg = generateMiaTerminal({ seed: 1 });
    const { total } = countElements(svg);
    expect(total).toBeGreaterThanOrEqual(QUALITY_BAR);
  });

  it('LGA terminal exceeds 200 path elements', () => {
    const svg = generateLgaTerminal({ seed: 1 });
    const { total } = countElements(svg);
    expect(total).toBeGreaterThanOrEqual(QUALITY_BAR);
  });

  it('DFW terminal exceeds 200 path elements', () => {
    const svg = generateDfwTerminal({ seed: 1 });
    const { total } = countElements(svg);
    expect(total).toBeGreaterThanOrEqual(QUALITY_BAR);
  });

  it('MCO terminal exceeds 200 path elements', () => {
    const svg = generateMcoTerminal({ seed: 1 });
    const { total } = countElements(svg);
    expect(total).toBeGreaterThanOrEqual(QUALITY_BAR);
  });

  it('Federal building exceeds 200 path elements', () => {
    const svg = generateFederalBuilding({ seed: 1 });
    const { total } = countElements(svg);
    expect(total).toBeGreaterThanOrEqual(QUALITY_BAR);
  });
});

describe('SVG structure', () => {
  it('every scene has 3 layer groups', () => {
    const generators = [generateMiaTerminal, generateLgaTerminal, generateDfwTerminal, generateMcoTerminal, generateFederalBuilding];
    for (const gen of generators) {
      const svg = gen();
      expect(svg).toContain('data-layer="background"');
      expect(svg).toContain('data-layer="midground"');
      expect(svg).toContain('data-layer="foreground"');
    }
  });

  it('uses paper background #FAF8F3', () => {
    const svg = generateMiaTerminal();
    expect(svg).toContain('#FAF8F3');
  });

  it('uses ink color #1a1a1a only', () => {
    const svg = generateLgaTerminal();
    // No other colors should be present (only paper bg + ink stroke)
    const colorMatches = svg.match(/#[0-9a-fA-F]{6}/g) ?? [];
    const unique = new Set(colorMatches.map((c) => c.toLowerCase()));
    expect(unique.size).toBeLessThanOrEqual(2); // paper + ink
    expect(unique).toContain('#faf8f3');
    expect(unique).toContain('#1a1a1a');
  });

  it('contains varying stroke widths (range 0.18 to 1.6)', () => {
    const svg = generateFederalBuilding();
    const widthMatches = svg.match(/stroke-width="([\d.]+)"/g) ?? [];
    const widths = widthMatches.map((m) => parseFloat(m.match(/[\d.]+/)![0]));
    const min = Math.min(...widths);
    const max = Math.max(...widths);
    expect(min).toBeLessThan(0.5);
    expect(max).toBeGreaterThan(1.0);
  });
});

describe('Scene registry', () => {
  it('resolves MIA tags', () => {
    expect(resolveSceneKey('mia')).toBe('mia');
    expect(resolveSceneKey('Miami')).toBe('mia');
    expect(resolveSceneKey('SJU')).toBe('mia');
  });

  it('resolves LGA/NYC tags', () => {
    expect(resolveSceneKey('LGA')).toBe('lga');
    expect(resolveSceneKey('New York')).toBe('lga');
    expect(resolveSceneKey('JFK')).toBe('lga');
    expect(resolveSceneKey('PANYNJ')).toBe('lga');
  });

  it('resolves DFW tags', () => {
    expect(resolveSceneKey('DFW')).toBe('dfw');
    expect(resolveSceneKey('Dallas')).toBe('dfw');
    expect(resolveSceneKey('Houston')).toBe('dfw');
  });

  it('resolves MCO tags', () => {
    expect(resolveSceneKey('MCO')).toBe('mco');
    expect(resolveSceneKey('Orlando')).toBe('mco');
  });

  it('resolves federal/government tags', () => {
    expect(resolveSceneKey('USACE')).toBe('federal');
    expect(resolveSceneKey('U.S. Navy NAVFAC')).toBe('federal');
    expect(resolveSceneKey('Federal Aviation')).toBe('federal');
    expect(resolveSceneKey('DoD')).toBe('federal');
  });

  it('returns null for unknown tags', () => {
    expect(resolveSceneKey('236220')).toBeNull();
    expect(resolveSceneKey('xyz')).toBeNull();
  });

  it('generateSceneFromTag returns null for unrecognized tag', () => {
    expect(generateSceneFromTag('236220', 'demo-001')).toBeNull();
  });

  it('generateSceneFromTag returns SVG for recognized tag', () => {
    const result = generateSceneFromTag('miami', 'demo-001');
    expect(result).not.toBeNull();
    expect(result?.key).toBe('mia');
    expect(result?.svg).toContain('<svg');
  });
});
