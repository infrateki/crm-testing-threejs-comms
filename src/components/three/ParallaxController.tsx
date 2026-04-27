import { useEffect, useRef, useCallback } from 'react';

export interface MouseState {
  x: number;
  y: number;
}

export interface ParallaxControllerHandle {
  mouseRef: React.RefObject<MouseState>;
}

interface ParallaxControllerProps {
  containerRef: React.RefObject<HTMLElement>;
  onInvalidate: () => void;
  children: (handle: ParallaxControllerHandle) => React.ReactNode;
}

export function ParallaxController({
  containerRef,
  onInvalidate,
  children,
}: ParallaxControllerProps) {
  const mouseRef = useRef<MouseState>({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -(((e.clientY - rect.top) / rect.height) * 2 - 1),
      };
      onInvalidate();
    },
    [containerRef, onInvalidate]
  );

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: 0, y: 0 };
    onInvalidate();
  }, [onInvalidate]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, handleMouseMove, handleMouseLeave]);

  return <>{children({ mouseRef })}</>;
}
