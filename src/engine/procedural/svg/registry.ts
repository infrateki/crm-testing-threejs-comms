/* Scene registry — maps geography_tag → SVG generator.
   Generators return complete SVG document strings. */

import { generateMiaTerminal } from './MiaTerminal';
import { generateLgaTerminal } from './LgaTerminal';
import { generateDfwTerminal } from './DfwTerminal';
import { generateMcoTerminal } from './McoTerminal';
import { generateFederalBuilding } from './FederalBuilding';

export type SceneKey = 'mia' | 'lga' | 'dfw' | 'mco' | 'federal';

export interface SceneOpts {
  width?: number;
  height?: number;
  seed?: number;
}

const GENERATORS: Record<SceneKey, (opts?: SceneOpts) => string> = {
  mia: generateMiaTerminal,
  lga: generateLgaTerminal,
  dfw: generateDfwTerminal,
  mco: generateMcoTerminal,
  federal: generateFederalBuilding,
};

/** Resolve a free-form geography_tag string to a known scene key. Returns null if no match. */
export function resolveSceneKey(tag: string | undefined | null): SceneKey | null {
  if (!tag) return null;
  const t = tag.toLowerCase();
  if (t.includes('mia') || t.includes('miami') || t.includes('sju') || t.includes('san juan')) return 'mia';
  if (t.includes('lga') || t.includes('laguardia') || t.includes('jfk') || t.includes('new york') || t.includes('nyc') || t.includes('panynj')) return 'lga';
  if (t.includes('dfw') || t.includes('dallas') || t.includes('fort worth') || t.includes('iah') || t.includes('houston')) return 'dfw';
  if (t.includes('mco') || t.includes('orlando') || t.includes('tpa') || t.includes('tampa') || t.includes('mia-civil')) return 'mco';
  if (t.includes('federal') || t.includes('sam') || t.includes('usace') || t.includes('court') || t.includes('navy') || t.includes('navfac') || t.includes('dod') || t.includes('gov')) return 'federal';
  // NAICS hint: 236220 (commercial construction) — pick at random for variety based on hash
  return null;
}

/** Generate an SVG string for the given scene, with stable seed derived from id. */
export function generateSceneSVG(
  key: SceneKey,
  id: string,
  opts: SceneOpts = {},
): string {
  const seed = opts.seed ?? hashString(id);
  return GENERATORS[key]({ width: 1600, height: 900, ...opts, seed });
}

/** Try to generate scene from arbitrary tag, returns null if no match. */
export function generateSceneFromTag(
  tag: string | undefined | null,
  id: string,
  opts: SceneOpts = {},
): { svg: string; key: SceneKey } | null {
  const key = resolveSceneKey(tag);
  if (!key) return null;
  return { svg: generateSceneSVG(key, id, opts), key };
}

/** Stable hash of a string → 32-bit number. */
export function hashString(s: string): number {
  let h = 0x9e3779b9;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h || 1;
}
