Read COMMS.md and CLAUDE.md. You are T3 — Ink Engine + Three.js owner.

First: `git checkout -b t3/ink-threejs` (branch from main after T1 merges, or from t1/foundation)

ultrathink

Tasks P12 + P13 + P14 + P15 + P16 + P17:

Build the two core differentiators: (1) the Canvas-based ink-sketch image processor with Web Worker offload, and (2) the Three.js parallax depth compositing system using @react-three/fiber. This is the visual engine that makes BIMSEARCH cards look like Arcus Private Wealth materials, not government spreadsheets.

### Image Pipeline Strategy
For demo/seed data, download representative photos of each facility:
- MIA South Terminal → search "Miami International Airport terminal interior" or "MIA airport expansion"
- PANYNJ LGA → search "LaGuardia Airport new terminal"
- DFW → search "DFW Airport terminal"
- MCO → search "Orlando Airport new terminal"
- SAM.gov federal → search "US Army Corps Engineers building" or "federal courthouse construction"

Save originals to `public/images/opportunities/` with descriptive names. Process each through InkSketchProcessor to generate ink-sketch versions. Save processed versions alongside as `{name}-ink.png`. These become the default illustrations for demo opportunities.

For production: users upload photos via the UI (T4's InkProcessor view + T5's upload flow), or the scan pipeline pulls images from portal listings.

### Requirements

1. **InkSketchProcessor** (src/engine/ink-processor/InkSketchProcessor.ts):
   - Orchestrator class that chains the 8-step pipeline
   - Input: HTMLImageElement or ImageData + ProcessorConfig
   - Output: { result: ImageData, layers: LayerOutput[], intermediates: ImageData[] }
   - Method: `process(image, config)` returns Promise (runs via Worker)
   - Method: `processWithIntermediates(image, config)` returns all 7 intermediate step results for pipeline visualization

2. **Processing pipeline modules** (each a separate file, pure functions):
   - `grayscale.ts`: ITU-R BT.709 luminance: 0.2126*R + 0.7152*G + 0.0722*B → Float32Array
   - `gaussian-blur.ts`: Separable convolution, configurable σ (default 1.4), kernel_size = ceil(σ*6)|1
   - `sobel-edges.ts`: 3×3 Gx/Gy Sobel kernels → { magnitude: Float32Array, direction: Float32Array }
   - `adaptive-threshold.ts`: Normalize magnitude 0–255, threshold at config value → Uint8Array
   - `line-weight.ts`: Scale edge opacity 0.35–1.0 based on magnitude → Float32Array
   - `hatching.ts`: Diagonal cross-hatch in shadow regions (gray < 80), orient with Sobel direction
   - `paper-composite.ts`: Alpha-blend ink onto paper (#FAF8F3 or #FFFFFF) + grain noise (±3 per channel)

3. **Web Worker** (src/engine/ink-processor/processor.worker.ts):
   - Receives: { imageData: ImageData, config: ProcessorConfig }
   - Runs steps 2–7 off main thread. Posts back edges + optional intermediates.
   - Use Transferable objects for zero-copy ArrayBuffer transfer
   - Step 8 (paper composite) runs on main thread (writes to visible Canvas)

4. **Presets** (src/engine/ink-processor/presets.ts):
   - ink-heavy: { threshold: 25, sigma: 1.0, lineWeight: 'heavy', hatching: true }
   - ink-light: { threshold: 55, sigma: 1.8, lineWeight: 'light', hatching: false }
   - ink-architectural: { threshold: 40, sigma: 1.4, lineWeight: 'medium', hatching: true }

5. **Layer Splitter** (src/engine/layer-splitter/*):
   - `LayerSplitter.ts`: Processed Canvas → 3 alpha-feathered depth layers
   - background: startY=0.0, endY=0.45, feather=0.08, factor=0.3, depth=10
   - midground: startY=0.25, endY=0.75, feather=0.10, factor=0.8, depth=5
   - foreground: startY=0.60, endY=1.0, feather=0.08, factor=1.5, depth=1
   - `alpha-feather.ts`: Gradient alpha at layer boundaries
   - `auto-segment.ts`: Fixed Y splits initially (heuristic edge-density detection later)
   - Output: Array of { name, dataURL (png), depth, parallaxFactor }

6. **Three.js R3F Components** (src/components/three/*):

   `ParallaxScene.tsx`: R3F Canvas, orthographic camera, gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}, camera zoom=1 position=[0,0,100] near=0.1 far=1000. Mouse tracking normalized -1 to 1.

   `DepthLayer.tsx`: Single textured plane at Z-depth. useTexture (drei), LinearFilter. useFrame lerp toward target with 0.08 smoothing. MeshBasicMaterial transparent=true depthWrite=false.

   `ParallaxController.tsx`: Mouse position state, scroll-based parallax alt, external control ref.

   `IllustrationViewer.tsx`: Takes Opportunity → checks illustration_url → splits layers → ParallaxScene. No illustration → procedural SceneGenerator. Exposes renderer ref for T5 export.

7. **Procedural Illustration Generator** (src/engine/procedural/*):
   - `SceneGenerator.ts`: geography_tag → scene type → Canvas 2D drawing
   - 5 scenes: terminal-curved (MIA), federal-building (SAM.gov), wide-terminal (DFW), modern-angular (LGA), curved-tower (MCO)
   - 5 primitives: palm-tree, crane, runway, jet-bridge, city-skyline
   - Hand-drawn style: jitter ±2px on control points, stroke width 0.5–2px, ink #1a1a1a at 0.3–1.0 opacity
   - Paper grain noise on background
   - MIA gets palm trees, LGA gets city skyline, etc.

### Performance targets
- Ink processor: < 3s desktop (2000px), < 8s mobile (1200px)
- Parallax: 60fps desktop, 30fps mobile
- Scene init: < 200ms. Texture load: < 100ms each. GPU mem < 30MB per card
- Texture cap 2048×2048. Pixel ratio cap: Math.min(devicePixelRatio, 2)
- invalidateFrameloop — render only when mouse moving
- Dispose textures + geometries on unmount

### Files you own (ONLY modify these)
- src/engine/ink-processor/* (all files)
- src/engine/layer-splitter/* (all files)
- src/engine/procedural/* (all files including scenes/ and primitives/)
- src/components/three/ParallaxScene.tsx
- src/components/three/DepthLayer.tsx
- src/components/three/ParallaxController.tsx
- src/components/three/IllustrationViewer.tsx
- public/images/opportunities/* (seed demo images)

### Files you must NOT touch
- src/design/*, src/components/layout/*, src/components/ui/* (T1)
- src/types/*, src/store/*, src/api/*, server/* (T2)
- src/views/*, src/components/cards/*, src/components/stats/* (T4)
- tests/* (T5)

### Constraints
- NEVER run Sobel/Gaussian on main thread — Web Worker mandatory
- Transferable objects in Worker postMessage
- Three.js: transparent=true, depthWrite=false always
- Check meshRef.current before useFrame access
- Named exports only. Use `/compact` at 60%

### When done
1. `npx tsc --noEmit` — must pass
2. Test: load image → ink sketch in < 3s. 3-layer parallax at 60fps.
3. Update COMMS.md: P12–P17 ✅ DONE
4. `git add -A && git commit -m "feat(T3): ink processor, Three.js parallax, procedural scenes" && git push -u origin t3/ink-threejs`
