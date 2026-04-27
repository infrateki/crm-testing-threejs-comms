import { useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { DepthLayer } from './DepthLayer';
import { ParallaxController } from './ParallaxController';
import type { LayerOutput } from '@/engine/ink-processor/types';

interface ParallaxSceneProps {
  layers: LayerOutput[];
  intensity?: number;
  style?: React.CSSProperties;
}

function SceneInvalidator({ onMount }: { onMount: (invalidate: () => void) => void }) {
  const { invalidate } = useThree();
  const mounted = useRef(false);
  if (!mounted.current) {
    mounted.current = true;
    onMount(invalidate);
  }
  return null;
}

export function ParallaxScene({ layers, intensity = 0.02, style }: ParallaxSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const invalidateRef = useRef<(() => void) | null>(null);

  const handleInvalidate = useCallback(() => {
    invalidateRef.current?.();
  }, []);

  const handleMount = useCallback((inv: () => void) => {
    invalidateRef.current = inv;
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      <ParallaxController containerRef={containerRef} onInvalidate={handleInvalidate}>
        {({ mouseRef }) => (
          <Canvas
            orthographic
            frameloop="demand"
            dpr={[1, Math.min(window.devicePixelRatio, 2)]}
            gl={{
              alpha: true,
              antialias: true,
              preserveDrawingBuffer: true,
            }}
            camera={{
              zoom: 1,
              position: [0, 0, 100],
              near: 0.1,
              far: 1000,
            }}
            style={{ background: 'transparent' }}
          >
            <SceneInvalidator onMount={handleMount} />
            {layers.map((layer) => (
              <DepthLayer
                key={layer.name}
                dataURL={layer.dataURL}
                depth={layer.depth}
                parallaxFactor={layer.parallaxFactor}
                mouseRef={mouseRef}
                intensity={intensity}
              />
            ))}
          </Canvas>
        )}
      </ParallaxController>
    </div>
  );
}
