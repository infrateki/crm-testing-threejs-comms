export interface SegmentBand {
  startY: number;
  endY: number;
  feather: number;
}

// Fixed Y-split heuristic. Future: edge-density detection.
export const SEGMENT_BANDS: Record<'background' | 'midground' | 'foreground', SegmentBand> = {
  background: { startY: 0.00, endY: 0.45, feather: 0.08 },
  midground:  { startY: 0.25, endY: 0.75, feather: 0.10 },
  foreground: { startY: 0.60, endY: 1.00, feather: 0.08 },
};

export type LayerName = keyof typeof SEGMENT_BANDS;
