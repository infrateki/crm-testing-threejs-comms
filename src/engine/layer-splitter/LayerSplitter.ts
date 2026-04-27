import { alphaFeather } from './alpha-feather';
import { SEGMENT_BANDS } from './auto-segment';
import type { LayerOutput } from '../ink-processor/types';

interface LayerDef {
  name: 'background' | 'midground' | 'foreground';
  depth: number;
  parallaxFactor: number;
}

const LAYER_DEFS: LayerDef[] = [
  { name: 'background', depth: 10, parallaxFactor: 0.3 },
  { name: 'midground',  depth: 5,  parallaxFactor: 0.8 },
  { name: 'foreground', depth: 1,  parallaxFactor: 1.5 },
];

export class LayerSplitter {
  split(source: HTMLCanvasElement | ImageData): LayerOutput[] {
    const { ctx, width, height } = this._toContext(source);
    const sourceData = ctx.getImageData(0, 0, width, height);

    return LAYER_DEFS.map(({ name, depth, parallaxFactor }) => {
      const band = SEGMENT_BANDS[name];
      const layerData = new ImageData(
        new Uint8ClampedArray(sourceData.data),
        width,
        height
      );
      alphaFeather(layerData.data, width, height, band.startY, band.endY, band.feather);

      const out = document.createElement('canvas');
      out.width = width;
      out.height = height;
      const outCtx = out.getContext('2d');
      if (!outCtx) throw new Error('No 2d context');
      outCtx.putImageData(layerData, 0, 0);

      return {
        name,
        dataURL: out.toDataURL('image/png'),
        depth,
        parallaxFactor,
      } satisfies LayerOutput;
    });
  }

  private _toContext(
    source: HTMLCanvasElement | ImageData
  ): { ctx: CanvasRenderingContext2D; width: number; height: number } {
    if (source instanceof HTMLCanvasElement) {
      const ctx = source.getContext('2d');
      if (!ctx) throw new Error('No 2d context');
      return { ctx, width: source.width, height: source.height };
    }
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.putImageData(source, 0, 0);
    return { ctx, width: source.width, height: source.height };
  }
}
