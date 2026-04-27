import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { ParallaxScene } from './ParallaxScene';
import { InkSketchProcessor } from '@/engine/ink-processor/InkSketchProcessor';
import { LayerSplitter } from '@/engine/layer-splitter/LayerSplitter';
import { SceneGenerator } from '@/engine/procedural/SceneGenerator';
import { PRESETS } from '@/engine/ink-processor/presets';
import { generateSceneFromTag, hashString } from '@/engine/procedural/svg/registry';
import { rasterizeSVG, rasterizeLayers, svgToDataURL } from '@/engine/procedural/svg/rasterize';
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
  function IllustrationViewer({ data, width = 1600, height = 900, style }, ref) {
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

      async function build() {
        setLoading(true);

        try {
          // ── Path A: User-uploaded photo → InkSketchProcessor (priority) ──
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

            const sourceCanvas = document.createElement('canvas');
            sourceCanvas.width = result.result.width;
            sourceCanvas.height = result.result.height;
            const ctx2d = sourceCanvas.getContext('2d');
            if (ctx2d) ctx2d.putImageData(result.result, 0, 0);

            if (cancelled) return;
            canvasRef.current = sourceCanvas;

            if (mobile) {
              setStaticDataURL(sourceCanvas.toDataURL('image/png'));
            } else {
              const splitter = new LayerSplitter();
              setLayers(splitter.split(sourceCanvas));
            }
            if (!cancelled) setLoading(false);
            return;
          }

          // ── Path B: Hand-crafted SVG architectural illustration ──
          // Try geography_tag first; if no match, deterministically pick a scene from ID hash.
          const sceneTag = data.geography_tag ?? data.id;
          let generated = generateSceneFromTag(sceneTag, data.id, { width, height });
          if (!generated) {
            const fallbackKeys: ('mia' | 'lga' | 'dfw' | 'mco' | 'federal')[] = ['mia', 'lga', 'dfw', 'mco', 'federal'];
            const key = fallbackKeys[hashString(data.id) % fallbackKeys.length];
            generated = generateSceneFromTag(key, data.id, { width, height });
          }

          if (generated) {
            const compositeCanvas = await rasterizeSVG(generated.svg, width, height);
            if (cancelled) return;
            canvasRef.current = compositeCanvas;

            if (mobile) {
              setStaticDataURL(svgToDataURL(generated.svg));
            } else {
              const splitLayers = await rasterizeLayers(generated.svg, width, height);
              if (!cancelled) setLayers(splitLayers);
            }
            if (!cancelled) setLoading(false);
            return;
          }

          // ── Path C: Legacy Canvas-based procedural fallback (extreme edge) ──
          const generator = new SceneGenerator(width, height);
          const scene = generator.generate(data.geography_tag ?? 'wide-terminal');
          if (cancelled) return;
          canvasRef.current = scene.canvas;
          if (mobile) {
            setStaticDataURL(scene.canvas.toDataURL('image/png'));
          } else {
            const splitter = new LayerSplitter();
            setLayers(splitter.split(scene.canvas));
          }
        } catch {
          // Final hard fallback: deterministic SVG scene by ID hash
          if (!cancelled) {
            const fallbackKeys: ('mia' | 'lga' | 'dfw' | 'mco' | 'federal')[] = ['mia', 'lga', 'dfw', 'mco', 'federal'];
            const key = fallbackKeys[hashString(data.id) % fallbackKeys.length];
            const generated = generateSceneFromTag(key, data.id, { width, height });
            if (generated) {
              const composite = await rasterizeSVG(generated.svg, width, height);
              canvasRef.current = composite;
              if (mobile) {
                setStaticDataURL(svgToDataURL(generated.svg));
              } else {
                setLayers(await rasterizeLayers(generated.svg, width, height));
              }
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

    // Mobile: static image (SVG preferred — lossless)
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
