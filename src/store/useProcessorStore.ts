import { create } from 'zustand';

export type ProcessingState = 'idle' | 'processing' | 'done' | 'error';
export type InkPreset = 'ink-heavy' | 'ink-light' | 'ink-architectural';

export interface ProcessorConfig {
  threshold: number;
  sigma: number;
  hatching: boolean;
  preset: InkPreset;
}

interface ProcessorState {
  currentImage: File | null;
  processingState: ProcessingState;
  result: ImageData | null;
  config: ProcessorConfig;
  errorMessage: string | null;
  setCurrentImage: (file: File | null) => void;
  setProcessingState: (state: ProcessingState) => void;
  setResult: (result: ImageData | null) => void;
  setConfig: (config: Partial<ProcessorConfig>) => void;
  setErrorMessage: (msg: string | null) => void;
  reset: () => void;
}

const DEFAULT_CONFIG: ProcessorConfig = {
  threshold: 40,
  sigma: 1.4,
  hatching: false,
  preset: 'ink-architectural',
};

export const useProcessorStore = create<ProcessorState>((set) => ({
  currentImage: null,
  processingState: 'idle',
  result: null,
  config: DEFAULT_CONFIG,
  errorMessage: null,

  setCurrentImage: (currentImage) => set({ currentImage }),

  setProcessingState: (processingState) => set({ processingState }),

  setResult: (result) => set({ result }),

  setConfig: (config) =>
    set((s) => ({ config: { ...s.config, ...config } })),

  setErrorMessage: (errorMessage) => set({ errorMessage }),

  reset: () =>
    set({
      currentImage: null,
      processingState: 'idle',
      result: null,
      errorMessage: null,
      config: DEFAULT_CONFIG,
    }),
}));
