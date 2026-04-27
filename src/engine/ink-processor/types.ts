export type LineWeight = 'heavy' | 'medium' | 'light';

export interface ProcessorConfig {
  threshold: number;
  sigma: number;
  lineWeight: LineWeight;
  hatching: boolean;
  paperColor?: string;
  includeIntermediates?: boolean;
}

export interface LayerOutput {
  name: 'background' | 'midground' | 'foreground';
  dataURL: string;
  depth: number;
  parallaxFactor: number;
}

export interface ProcessorResult {
  result: ImageData;
  layers: LayerOutput[];
  intermediates: ImageData[];
}

export interface WorkerRequest {
  imageData: ImageData;
  config: ProcessorConfig;
  includeIntermediates: boolean;
}

// Worker transfers ArrayBuffers (zero-copy) — main thread wraps in Float32Array/Uint8Array
export interface WorkerResponse {
  edgesBuffer: ArrayBuffer;
  magnitudeBuffer: ArrayBuffer;
  directionBuffer: ArrayBuffer;
  grayscaleBuffer: ArrayBuffer;
  width: number;
  height: number;
  intermediateBuffers?: ArrayBuffer[];
}
