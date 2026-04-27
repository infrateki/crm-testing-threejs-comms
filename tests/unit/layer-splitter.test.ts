import { describe, it, expect } from 'vitest';
import { LayerSplitter } from '@/engine/layer-splitter/LayerSplitter';

// Canvas API (HTMLCanvasElement, ImageData) polyfilled by tests/unit/setup.ts

function makeSourceCanvas(width = 4, height = 4): HTMLCanvasElement {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  Object.defineProperty(canvas, 'width',  { value: width,  configurable: true });
  Object.defineProperty(canvas, 'height', { value: height, configurable: true });
  return canvas;
}

function makeImageDataInput(width = 4, height = 4): ImageData {
  return new ImageData(new Uint8ClampedArray(width * height * 4).fill(200), width, height);
}

describe('LayerSplitter', () => {
  it('splits into exactly 3 layers', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeSourceCanvas());
    expect(layers).toHaveLength(3);
  });

  it('layer names are background, midground, foreground', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeSourceCanvas());
    const names = layers.map((l) => l.name);
    expect(names).toContain('background');
    expect(names).toContain('midground');
    expect(names).toContain('foreground');
  });

  it('background has lowest parallaxFactor (0.3)', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeSourceCanvas());
    const bg = layers.find((l) => l.name === 'background');
    expect(bg?.parallaxFactor).toBe(0.3);
  });

  it('midground has parallaxFactor 0.8', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeSourceCanvas());
    const mg = layers.find((l) => l.name === 'midground');
    expect(mg?.parallaxFactor).toBe(0.8);
  });

  it('foreground has highest parallaxFactor (1.5)', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeSourceCanvas());
    const fg = layers.find((l) => l.name === 'foreground');
    expect(fg?.parallaxFactor).toBe(1.5);
  });

  it('each layer has a dataURL string', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeSourceCanvas());
    layers.forEach((l) => {
      expect(typeof l.dataURL).toBe('string');
      expect(l.dataURL.length).toBeGreaterThan(0);
    });
  });

  it('depth values are 10, 5, 1 for bg/mg/fg', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeSourceCanvas());
    expect(layers.find((l) => l.name === 'background')?.depth).toBe(10);
    expect(layers.find((l) => l.name === 'midground')?.depth).toBe(5);
    expect(layers.find((l) => l.name === 'foreground')?.depth).toBe(1);
  });

  it('accepts ImageData input', () => {
    const splitter = new LayerSplitter();
    const layers = splitter.split(makeImageDataInput());
    expect(layers).toHaveLength(3);
  });
});
