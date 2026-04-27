import { drawTerminalCurved } from './scenes/terminal-curved';
import { drawFederalBuilding } from './scenes/federal-building';
import { drawWideTerminal } from './scenes/wide-terminal';
import { drawModernAngular } from './scenes/modern-angular';
import { drawCurvedTower } from './scenes/curved-tower';

export type GeographyTag =
  | 'mia' | 'miami'
  | 'federal' | 'sam' | 'usace' | 'courthouse'
  | 'dfw' | 'dallas'
  | 'lga' | 'new-york' | 'ny'
  | 'mco' | 'orlando';

type SceneType = 'terminal-curved' | 'federal-building' | 'wide-terminal' | 'modern-angular' | 'curved-tower';

function resolveScene(tag: string): SceneType {
  const t = tag.toLowerCase();
  if (t.includes('mia') || t.includes('miami')) return 'terminal-curved';
  if (t.includes('federal') || t.includes('sam') || t.includes('usace') || t.includes('court')) return 'federal-building';
  if (t.includes('dfw') || t.includes('dallas') || t.includes('fort worth')) return 'wide-terminal';
  if (t.includes('lga') || t.includes('laguardia') || t.includes('new york') || t.includes('nyc')) return 'modern-angular';
  if (t.includes('mco') || t.includes('orlando')) return 'curved-tower';
  // Default: wide-terminal for unknown airport tags
  return 'wide-terminal';
}

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const SCENE_MAP: Record<SceneType, DrawFn> = {
  'terminal-curved': drawTerminalCurved,
  'federal-building': drawFederalBuilding,
  'wide-terminal': drawWideTerminal,
  'modern-angular': drawModernAngular,
  'curved-tower': drawCurvedTower,
};

export interface GeneratedScene {
  canvas: HTMLCanvasElement;
  dataURL: string;
  sceneType: SceneType;
}

export class SceneGenerator {
  private width: number;
  private height: number;

  constructor(width = 1200, height = 800) {
    this.width = Math.min(width, 2048);
    this.height = Math.min(height, 2048);
  }

  generate(geographyTag: string): GeneratedScene {
    const sceneType = resolveScene(geographyTag);
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    SCENE_MAP[sceneType](ctx, this.width, this.height);

    return {
      canvas,
      dataURL: canvas.toDataURL('image/png'),
      sceneType,
    };
  }
}
