import type { ProcessorConfig } from './types';

export const PRESETS: Record<string, ProcessorConfig> = {
  'ink-heavy': {
    threshold: 25,
    sigma: 1.0,
    lineWeight: 'heavy',
    hatching: true,
  },
  'ink-light': {
    threshold: 55,
    sigma: 1.8,
    lineWeight: 'light',
    hatching: false,
  },
  'ink-architectural': {
    threshold: 40,
    sigma: 1.4,
    lineWeight: 'medium',
    hatching: true,
  },
} as const;

export type PresetName = keyof typeof PRESETS;
