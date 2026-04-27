import { useCallback, useRef, useState } from 'react';
import { InkSketchProcessor } from '@/engine/ink-processor/InkSketchProcessor';
import { LayerSplitter } from '@/engine/layer-splitter/LayerSplitter';
import { BASE_URL } from '@/api/client';
import type { LayerOutput } from '@/engine/ink-processor/types';

export type UploadPhase = 'idle' | 'uploading' | 'processing' | 'splitting' | 'done' | 'error';

export interface PhotoUploadResult {
  layers: LayerOutput[];
  processedDataURL: string;
}

export interface UsePhotoUploadReturn {
  phase: UploadPhase;
  error: string | null;
  result: PhotoUploadResult | null;
  upload: (file: File, opportunityId?: string) => Promise<PhotoUploadResult | null>;
  reset: () => void;
}

export function usePhotoUpload(): UsePhotoUploadReturn {
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoUploadResult | null>(null);
  const processorRef = useRef<InkSketchProcessor | null>(null);

  const upload = useCallback(
    async (file: File, opportunityId?: string): Promise<PhotoUploadResult | null> => {
      setPhase('uploading');
      setError(null);
      setResult(null);

      try {
        let uploadedURL: string | null = null;

        if (opportunityId) {
          const body = new FormData();
          body.append('photo', file);
          const res = await fetch(`${BASE_URL}/api/opportunities/${opportunityId}/photos`, {
            method: 'POST',
            body,
          });
          if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
          const json = (await res.json()) as { url?: string };
          uploadedURL = json.url ?? null;
        }

        setPhase('processing');

        if (!processorRef.current) {
          processorRef.current = new InkSketchProcessor();
        }

        const img = await _loadImage(uploadedURL ?? URL.createObjectURL(file));
        const processorResult = await processorRef.current.process(img, {
          threshold: 40,
          sigma: 1.4,
          lineWeight: 'medium',
          hatching: false,
          paperColor: '#FAF8F3',
        });

        setPhase('splitting');

        const splitter = new LayerSplitter();
        const outCanvas = document.createElement('canvas');
        outCanvas.width = processorResult.result.width;
        outCanvas.height = processorResult.result.height;
        const ctx = outCanvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');
        ctx.putImageData(processorResult.result, 0, 0);

        const layers = splitter.split(outCanvas);
        const processedDataURL = outCanvas.toDataURL('image/png');

        if (opportunityId && uploadedURL) {
          fetch(`${BASE_URL}/api/opportunities/${opportunityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processed_url: processedDataURL }),
          }).catch(() => {});
        }

        const out: PhotoUploadResult = { layers, processedDataURL };
        setResult(out);
        setPhase('done');
        return out;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setError(msg);
        setPhase('error');
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setPhase('idle');
    setError(null);
    setResult(null);
  }, []);

  return { phase, error, result, upload, reset };
}

function _loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
