import { describe, it, expect } from 'vitest';
import { toGrayscale } from '@/engine/ink-processor/grayscale';
import { sobelEdges } from '@/engine/ink-processor/sobel-edges';
import { adaptiveThreshold } from '@/engine/ink-processor/adaptive-threshold';

// ── helpers ─────────────────────────────────────────────────────────

function makeImageData(width: number, height: number, fillRGBA: [number, number, number, number]): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4]     = fillRGBA[0];
    data[i * 4 + 1] = fillRGBA[1];
    data[i * 4 + 2] = fillRGBA[2];
    data[i * 4 + 3] = fillRGBA[3];
  }
  return { data, width, height, colorSpace: 'srgb' } as unknown as ImageData;
}

function makeSyntheticEdge(size: number): Float32Array {
  // Left half = 0, right half = 255 → vertical edge in center
  const arr = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      arr[y * size + x] = x < size / 2 ? 0 : 255;
    }
  }
  return arr;
}

// ── toGrayscale ──────────────────────────────────────────────────────

describe('toGrayscale', () => {
  it('returns Float32Array of correct length', () => {
    const img = makeImageData(4, 4, [128, 128, 128, 255]);
    const result = toGrayscale(img);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(16);
  });

  it('converts pure red correctly (BT.709: 0.2126)', () => {
    const img = makeImageData(1, 1, [255, 0, 0, 255]);
    const [v] = toGrayscale(img);
    expect(v).toBeCloseTo(0.2126 * 255, 1);
  });

  it('converts pure green correctly (BT.709: 0.7152)', () => {
    const img = makeImageData(1, 1, [0, 255, 0, 255]);
    const [v] = toGrayscale(img);
    expect(v).toBeCloseTo(0.7152 * 255, 1);
  });

  it('converts pure blue correctly (BT.709: 0.0722)', () => {
    const img = makeImageData(1, 1, [0, 0, 255, 255]);
    const [v] = toGrayscale(img);
    expect(v).toBeCloseTo(0.0722 * 255, 1);
  });

  it('white pixel gives 255', () => {
    const img = makeImageData(1, 1, [255, 255, 255, 255]);
    const [v] = toGrayscale(img);
    expect(v).toBeCloseTo(255, 0);
  });

  it('black pixel gives 0', () => {
    const img = makeImageData(1, 1, [0, 0, 0, 255]);
    const [v] = toGrayscale(img);
    expect(v).toBe(0);
  });
});

// ── sobelEdges ───────────────────────────────────────────────────────

describe('sobelEdges', () => {
  it('returns magnitude and direction arrays of correct size', () => {
    const size = 6;
    const data = new Float32Array(size * size);
    const { magnitude, direction } = sobelEdges(data, size, size);
    expect(magnitude).toBeInstanceOf(Float32Array);
    expect(direction).toBeInstanceOf(Float32Array);
    expect(magnitude.length).toBe(size * size);
    expect(direction.length).toBe(size * size);
  });

  it('flat image produces zero magnitude', () => {
    const size = 5;
    const data = new Float32Array(size * size).fill(128);
    const { magnitude } = sobelEdges(data, size, size);
    const allZero = Array.from(magnitude).every((v) => v === 0);
    expect(allZero).toBe(true);
  });

  it('detects vertical edge in center', () => {
    const size = 10;
    const data = makeSyntheticEdge(size);
    const { magnitude } = sobelEdges(data, size, size);
    const centerX = size / 2;
    let edgeDetected = false;
    for (let y = 1; y < size - 1; y++) {
      if (magnitude[y * size + centerX] > 50) {
        edgeDetected = true;
        break;
      }
    }
    expect(edgeDetected).toBe(true);
  });

  it('border pixels remain zero (not computed)', () => {
    const size = 8;
    const data = makeSyntheticEdge(size);
    const { magnitude } = sobelEdges(data, size, size);
    for (let x = 0; x < size; x++) {
      expect(magnitude[x]).toBe(0);
      expect(magnitude[(size - 1) * size + x]).toBe(0);
    }
  });
});

// ── adaptiveThreshold ────────────────────────────────────────────────

describe('adaptiveThreshold', () => {
  it('returns Uint8Array of correct length', () => {
    const mag = new Float32Array([0, 100, 200, 300]);
    const result = adaptiveThreshold(mag, 128);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(4);
  });

  it('all-zero magnitude returns all zeros', () => {
    const mag = new Float32Array(10);
    const result = adaptiveThreshold(mag, 50);
    expect(Array.from(result).every((v) => v === 0)).toBe(true);
  });

  it('values above threshold become 1', () => {
    const mag = new Float32Array([0, 100, 200]);
    const result = adaptiveThreshold(mag, 50);
    expect(result[2]).toBe(1);
  });

  it('values below threshold become 0', () => {
    const mag = new Float32Array([0, 100, 200]);
    const result = adaptiveThreshold(mag, 200);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(0);
  });

  it('threshold=0 yields all 1s for non-zero input', () => {
    const mag = new Float32Array([50, 100, 150]);
    const result = adaptiveThreshold(mag, 0);
    expect(Array.from(result).every((v) => v === 1)).toBe(true);
  });

  it('produces binary output (only 0 or 1)', () => {
    const mag = new Float32Array(Array.from({ length: 20 }, (_, i) => i * 10));
    const result = adaptiveThreshold(mag, 128);
    const isBinary = Array.from(result).every((v) => v === 0 || v === 1);
    expect(isBinary).toBe(true);
  });
});
