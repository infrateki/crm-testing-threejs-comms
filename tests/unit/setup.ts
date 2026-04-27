import { vi } from 'vitest';

// Polyfill ImageData for jsdom (Canvas API not implemented by jsdom)
if (typeof ImageData === 'undefined') {
  class ImageDataPolyfill {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace: string = 'srgb';

    constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height ?? dataOrWidth.length / (widthOrHeight * 4);
      } else {
        this.width = dataOrWidth;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      }
    }
  }

  vi.stubGlobal('ImageData', ImageDataPolyfill);
}

// Stub HTMLCanvasElement.getContext to return a usable 2D context mock
const _makeCtxMock = (canvas: HTMLCanvasElement) => {
  const ctx = {
    canvas,
    getImageData: vi.fn((_x: number, _y: number, w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4).fill(128),
      width: w,
      height: h,
      colorSpace: 'srgb',
    })),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 50 })),
    fillText: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    createImageData: vi.fn((w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    fillStyle: '',
    font: '',
    letterSpacing: '',
    textBaseline: '',
  };
  return ctx as unknown as CanvasRenderingContext2D;
};

// Patch HTMLCanvasElement.prototype.getContext
const _origGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextId: string, ...args: unknown[]) {
  if (contextId === '2d') {
    return _makeCtxMock(this);
  }
  return _origGetContext.call(this, contextId as '2d', ...args);
} as typeof HTMLCanvasElement.prototype.getContext;

// Patch HTMLCanvasElement.prototype.toDataURL
HTMLCanvasElement.prototype.toDataURL = function (_type?: string) {
  return 'data:image/png;base64,mock==';
};
