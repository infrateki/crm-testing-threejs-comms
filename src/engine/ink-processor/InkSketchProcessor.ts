import { paperComposite } from './paper-composite';
import type { ProcessorConfig, ProcessorResult, WorkerRequest, WorkerResponse } from './types';

export class InkSketchProcessor {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      new URL('./processor.worker.ts', import.meta.url),
      { type: 'module' }
    );
  }

  process(image: HTMLImageElement | ImageData, config: ProcessorConfig): Promise<ProcessorResult> {
    return this._run(image, config, false);
  }

  processWithIntermediates(
    image: HTMLImageElement | ImageData,
    config: ProcessorConfig
  ): Promise<ProcessorResult> {
    return this._run(image, config, true);
  }

  private _imageToData(image: HTMLImageElement | ImageData): ImageData {
    if (image instanceof ImageData) return image;
    const w = Math.min(image.naturalWidth || image.width, 2048);
    const h = Math.min(image.naturalHeight || image.height, 2048);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    ctx.drawImage(image, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }

  private _run(
    image: HTMLImageElement | ImageData,
    config: ProcessorConfig,
    includeIntermediates: boolean
  ): Promise<ProcessorResult> {
    return new Promise((resolve, reject) => {
      const imageData = this._imageToData(image);
      const request: WorkerRequest = { imageData, config, includeIntermediates };

      const onMessage = (e: MessageEvent<WorkerResponse>) => {
        this.worker.removeEventListener('message', onMessage);
        this.worker.removeEventListener('error', onError);

        const { edgesBuffer, width, height, intermediateBuffers } = e.data;
        const edges = new Float32Array(edgesBuffer);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx2d = canvas.getContext('2d');
        if (!ctx2d) { reject(new Error('No 2d context')); return; }

        paperComposite(ctx2d, edges, width, height, config.paperColor);
        const result = ctx2d.getImageData(0, 0, width, height);

        const intermediates: ImageData[] = [];
        if (includeIntermediates && intermediateBuffers) {
          for (const buf of intermediateBuffers) {
            const arr = new Float32Array(buf);
            const ic = document.createElement('canvas');
            ic.width = width;
            ic.height = height;
            const ictx = ic.getContext('2d');
            if (!ictx) continue;
            const id = ictx.createImageData(width, height);
            for (let i = 0; i < arr.length; i++) {
              const v = Math.min(255, Math.round(Math.abs(arr[i])));
              id.data[i * 4]     = v;
              id.data[i * 4 + 1] = v;
              id.data[i * 4 + 2] = v;
              id.data[i * 4 + 3] = 255;
            }
            ictx.putImageData(id, 0, 0);
            intermediates.push(id);
          }
        }

        resolve({ result, layers: [], intermediates });
      };

      const onError = (err: ErrorEvent) => {
        this.worker.removeEventListener('message', onMessage);
        this.worker.removeEventListener('error', onError);
        reject(new Error(err.message));
      };

      this.worker.addEventListener('message', onMessage);
      this.worker.addEventListener('error', onError);
      this.worker.postMessage(request, [imageData.data.buffer]);
    });
  }

  dispose(): void {
    this.worker.terminate();
  }
}
