import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { ParallaxScene } from './ParallaxScene';
import { InkSketchProcessor } from '@/engine/ink-processor/InkSketchProcessor';
import { LayerSplitter } from '@/engine/layer-splitter/LayerSplitter';
import { SceneGenerator } from '@/engine/procedural/SceneGenerator';
import { PRESETS } from '@/engine/ink-processor/presets';
import type { LayerOutput } from '@/engine/ink-processor/types';

export interface IllustrationData {
  id: string;
  illustration_url?: string;
  geography_tag?: string;
}

export interface IllustrationViewerHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

interface IllustrationViewerProps {
  data: IllustrationData;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const isMobile = (): boolean =>
  /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

export const IllustrationViewer = forwardRef<IllustrationViewerHandle, IllustrationViewerProps>(
  function IllustrationViewer({ data, width = 1200, height = 800, style }, ref) {
    const [layers, setLayers] = useState<LayerOutput[]>([]);
    const [staticDataURL, setStaticDataURL] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mobile = isMobile();

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      let cancelled = false;
      const splitter = new LayerSplitter();

      async function build() {
        setLoading(true);

        try {
          let sourceCanvas: HTMLCanvasElement;

          if (data.illustration_url) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = data.illustration_url!;
            });

            const processor = new InkSketchProcessor();
            const result = await processor.process(img, PRESETS['ink-architectural']);
            processor.dispose();

            sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = result.result.width;
            sourceCanvas.height = result.result.height;
            const ctx2d = sourceCanvas.getContext('2d');
            if (ctx2d) ctx2d.putImageData(result.result, 0, 0);
          } else {
            const generator = new SceneGenerator(width, height);
            const scene = generator.generate(data.geography_tag ?? 'wide-terminal');
            sourceCanvas = scene.canvas;
          }

          if (cancelled) return;

          canvasRef.current = sourceCanvas;

          if (mobile) {
            setStaticDataURL(sourceCanvas.toDataURL('image/png'));
          } else {
            const splitLayers = splitter.split(sourceCanvas);
            setLayers(splitLayers);
          }
        } catch {
          // Fallback: blank procedural scene
          if (!cancelled) {
            const gen = new SceneGenerator(width, height);
            const scene = gen.generate('wide-terminal');
            canvasRef.current = scene.canvas;
            if (mobile) {
              setStaticDataURL(scene.canvas.toDataURL('image/png'));
            } else {
              setLayers(splitter.split(scene.canvas));
            }
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      void build();
      return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.id, data.illustration_url, data.geography_tag]);

    if (loading) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#FAF8F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#9CA3AF' }}>
            rendering…
          </span>
        </div>
      );
    }

    // Mobile: static image with CSS parallax fallback
    if (mobile && staticDataURL) {
      return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}>
          <img
            src={staticDataURL}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'translate3d(0,0,0)',
            }}
          />
        </div>
      );
    }

    return <ParallaxScene layers={layers} style={style} />;
  }
);
