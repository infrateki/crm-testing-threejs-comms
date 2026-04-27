import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { InkSketchProcessor } from '@/engine/ink-processor/InkSketchProcessor'
import { LayerSplitter } from '@/engine/layer-splitter/LayerSplitter'
import { ParallaxScene } from '@/components/three/ParallaxScene'
import type { ProcessorConfig, LayerOutput } from '@/engine/ink-processor/types'
import { useOpportunities } from '@/api/opportunities'
import type { OpportunitiesResponse } from '@/api/opportunities'
import { useOpportunityStore } from '@/store/useOpportunityStore'
import { useIllustrationOverrides } from '@/store/useIllustrationOverrides'
import { DEMO_OPPORTUNITIES } from './_fixtures'

type Preset = 'ink-heavy' | 'ink-light' | 'ink-architectural'
type LineWeight = 'heavy' | 'medium' | 'light'

interface ProcessorSettings {
  preset: Preset
  threshold: number
  sigma: number
  lineWeight: LineWeight
  hatching: boolean
  paperColor: string
}

interface PipelineStage {
  label: string
  dataUrl: string
}

const PAPER_COLORS: Record<'cream' | 'white', string> = {
  cream: '#FAF8F3',
  white: '#FFFFFF',
}

const PRESET_DEFAULTS: Record<Preset, Omit<ProcessorSettings, 'preset'>> = {
  'ink-heavy': { threshold: 25, sigma: 1.0, lineWeight: 'heavy', hatching: true, paperColor: PAPER_COLORS.cream },
  'ink-light': { threshold: 55, sigma: 1.8, lineWeight: 'light', hatching: false, paperColor: PAPER_COLORS.white },
  'ink-architectural': { threshold: 40, sigma: 1.4, lineWeight: 'medium', hatching: true, paperColor: PAPER_COLORS.cream },
}

const STAGE_LABELS = ['Grayscale', 'Blur', 'Gradient', 'NMS', 'Hysteresis']

function imageDataToDataUrl(data: ImageData): string {
  const canvas = document.createElement('canvas')
  canvas.width = data.width
  canvas.height = data.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.putImageData(data, 0, 0)
  return canvas.toDataURL('image/png')
}

const processor = new InkSketchProcessor()
const splitter = new LayerSplitter()

export function InkProcessor() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [intermediates, setIntermediates] = useState<PipelineStage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [paper, setPaper] = useState<'cream' | 'white'>('cream')
  const [settings, setSettings] = useState<ProcessorSettings>({
    preset: 'ink-architectural',
    ...PRESET_DEFAULTS['ink-architectural'],
  })

  const [parallaxLayers, setParallaxLayers] = useState<LayerOutput[]>([])
  const [showAssign, setShowAssign] = useState(false)
  const [assignOppId, setAssignOppId] = useState('')
  const [assignedTitle, setAssignedTitle] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const updateOpportunity = useOpportunityStore((s) => s.updateOpportunity)
  const setIllustrationOverride = useIllustrationOverrides((s) => s.setOverride)
  const { data: oppsResponse } = useOpportunities()
  const allOpps = oppsResponse?.data ?? DEMO_OPPORTUNITIES

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleAssign = () => {
    if (!assignOppId || !processedUrl) return
    updateOpportunity(assignOppId, { illustration_url: processedUrl })
    setIllustrationOverride(assignOppId, processedUrl)
    queryClient.setQueriesData<OpportunitiesResponse>(
      { queryKey: ['opportunities'], exact: false },
      (old) => {
        const base = old ?? {
          data: DEMO_OPPORTUNITIES,
          total: DEMO_OPPORTUNITIES.length,
          page: 1,
          limit: 50,
        }
        return {
          ...base,
          data: base.data.map((o) =>
            o.id === assignOppId ? { ...o, illustration_url: processedUrl } : o,
          ),
        }
      },
    )
    const opp = allOpps.find((o) => o.id === assignOppId)
    setAssignedTitle(opp?.title ?? assignOppId)
    setAssignOppId('')
    setShowAssign(false)
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    setProcessedUrl(null)
    setIntermediates([])
    setParallaxLayers([])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleProcess = async () => {
    const img = imgRef.current
    if (!img || !originalUrl) return

    setIsProcessing(true)
    try {
      const config: ProcessorConfig = {
        threshold: settings.threshold,
        sigma: settings.sigma,
        lineWeight: settings.lineWeight,
        hatching: settings.hatching,
        paperColor: settings.paperColor,
        includeIntermediates: true,
      }
      const result = await processor.processWithIntermediates(img, config)
      setProcessedUrl(imageDataToDataUrl(result.result))
      setIntermediates(
        result.intermediates.map((imgData, i) => ({
          label: STAGE_LABELS[i] ?? `Stage ${i + 1}`,
          dataUrl: imageDataToDataUrl(imgData),
        })),
      )
      setParallaxLayers(splitter.split(result.result))
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePresetChange = (preset: Preset) => {
    const defaults = PRESET_DEFAULTS[preset]
    setSettings({ preset, ...defaults })
    setPaper(defaults.paperColor === PAPER_COLORS.cream ? 'cream' : 'white')
  }

  const handlePaperChange = (p: 'cream' | 'white') => {
    setPaper(p)
    setSettings((s) => ({ ...s, paperColor: PAPER_COLORS[p] }))
  }

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  return (
    <div>
      <SectionLabel>Engine</SectionLabel>
      <h1
        style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '36px',
          fontWeight: 900,
          color: 'var(--ink-primary)',
          letterSpacing: '-0.02em',
          marginTop: '8px',
          marginBottom: '24px',
        }}
      >
        Ink Processor
      </h1>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--accent-sage)' : 'var(--border)'}`,
          borderRadius: '3px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragOver ? 'var(--bg-cream)' : 'var(--bg-primary)',
          transition: 'all 0.2s',
          marginBottom: '32px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: isDragOver ? 'var(--accent-sage)' : 'var(--ink-tertiary)',
            marginBottom: '8px',
          }}
        >
          {originalUrl ? 'Drop a new image to replace' : 'Drop image here or click to upload'}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-muted)' }}>
          PNG, JPG, WEBP · Max 2048×2048
        </p>
      </div>

      {originalUrl && (
        <>
          {/* Controls + Preview */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {/* Controls */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '20px',
                background: 'var(--bg-cream)',
              }}
            >
              <SectionLabel>Settings</SectionLabel>

              {/* Preset */}
              <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--ink-tertiary)',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Preset
                </label>
                <select
                  value={settings.preset}
                  onChange={(e) => handlePresetChange(e.target.value as Preset)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--ink-secondary)',
                    background: 'var(--bg-primary)',
                  }}
                >
                  <option value="ink-architectural">Ink Architectural</option>
                  <option value="ink-heavy">Ink Heavy</option>
                  <option value="ink-light">Ink Light</option>
                </select>
              </div>

              {[
                { key: 'threshold', label: 'Threshold', min: 0, max: 100, step: 1 },
                { key: 'sigma', label: 'Sigma', min: 0.5, max: 3.0, step: 0.1 },
              ].map(({ key, label, min, max, step }) => (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <label
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--ink-tertiary)',
                      }}
                    >
                      {label}
                    </label>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {settings[key as keyof ProcessorSettings]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={settings[key as keyof ProcessorSettings] as number}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, [key]: parseFloat(e.target.value) }))
                    }
                    style={{ width: '100%', accentColor: 'var(--accent-sage)' }}
                  />
                </div>
              ))}

              {/* Hatching toggle */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--ink-tertiary)',
                  }}
                >
                  Hatching
                </span>
                <button
                  onClick={() => setSettings((s) => ({ ...s, hatching: !s.hatching }))}
                  style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: settings.hatching ? 'var(--accent-sage)' : 'var(--border)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: settings.hatching ? '18px' : '2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>

              {/* Paper */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--ink-tertiary)',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Paper
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['cream', 'white'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePaperChange(p)}
                      style={{
                        flex: 1,
                        padding: '6px',
                        border:
                          paper === p
                            ? '1px solid var(--accent-sage)'
                            : '1px solid var(--border)',
                        borderRadius: '3px',
                        background: p === 'cream' ? '#FAF8F3' : '#FFFFFF',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: paper === p ? 'var(--accent-sage)' : 'var(--ink-muted)',
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleProcess}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: isProcessing ? 'var(--border)' : 'var(--ink-primary)',
                  color: isProcessing ? 'var(--ink-muted)' : '#fff',
                  border: 'none',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase' as const,
                  transition: 'background 0.15s',
                }}
              >
                {isProcessing ? 'Processing…' : 'Process Image'}
              </button>
            </div>

            {/* Before/After */}
            <div
              style={{
                border: '1px solid var(--border)',
                borderRadius: '3px',
                overflow: 'hidden',
                background: 'var(--bg-cream)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
              }}
            >
              <div style={{ position: 'relative', borderRight: '1px solid var(--border)' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.06em',
                    zIndex: 1,
                  }}
                >
                  BEFORE
                </div>
                <img
                  ref={imgRef}
                  src={originalUrl}
                  alt="Original"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    padding: '2px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.06em',
                    zIndex: 1,
                  }}
                >
                  AFTER
                </div>
                {processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Processed"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '300px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--ink-ghost)',
                    }}
                  >
                    {isProcessing ? 'Processing…' : 'Press Process to generate'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pipeline visualization */}
          {intermediates.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <SectionLabel>Processing Pipeline</SectionLabel>
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}
              >
                {intermediates.map((stage) => (
                  <div
                    key={stage.label}
                    style={{
                      flexShrink: 0,
                      width: '140px',
                      border: '1px solid var(--border)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                      background: 'var(--bg-cream)',
                    }}
                  >
                    <img
                      src={stage.dataUrl}
                      alt={stage.label}
                      style={{ width: '100%', height: '90px', objectFit: 'cover', display: 'block' }}
                    />
                    <div
                      style={{
                        padding: '6px 8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--ink-muted)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase' as const,
                      }}
                    >
                      {stage.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Parallax 3D preview */}
          {parallaxLayers.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <SectionLabel>Parallax Preview</SectionLabel>
              <div
                style={{
                  marginTop: '16px',
                  height: '320px',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <ParallaxScene layers={parallaxLayers} intensity={0.02} style={{ height: '100%' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    padding: '3px 8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--ink-muted)',
                    letterSpacing: '0.04em',
                    pointerEvents: 'none',
                  }}
                >
                  MOVE MOUSE TO ACTIVATE PARALLAX · {parallaxLayers.length} LAYERS
                </div>
              </div>
            </section>
          )}

          {/* Action buttons */}
          {processedUrl && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  onClick={() => handleDownload(processedUrl, 'ink-processed.png')}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--ink-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  Download PNG
                </button>
                <button
                  onClick={() => handleDownload(processedUrl, 'ink-processed.svg')}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--bg-cream)',
                    color: 'var(--ink-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  Download SVG
                </button>
                <button
                  onClick={() => { setShowAssign((v) => !v); setAssignedTitle(null) }}
                  style={{
                    padding: '10px 20px',
                    background: showAssign ? 'var(--accent-sage)' : 'var(--bg-cream)',
                    color: showAssign ? '#fff' : 'var(--accent-sage)',
                    border: '1px solid var(--accent-sage)',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    transition: 'all 0.15s',
                  }}
                >
                  Assign to Opportunity
                </button>
                {assignedTitle && (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    ✓ Assigned to {assignedTitle}
                  </span>
                )}
              </div>

              {/* Assign panel */}
              {showAssign && (
                <div
                  style={{
                    border: '1px solid var(--accent-sage)',
                    borderRadius: '3px',
                    padding: '20px 24px',
                    background: 'var(--bg-cream)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    maxWidth: '560px',
                  }}
                >
                  <SectionLabel>Select Opportunity</SectionLabel>
                  <select
                    value={assignOppId}
                    onChange={(e) => setAssignOppId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '3px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: assignOppId ? 'var(--ink-primary)' : 'var(--ink-muted)',
                      background: 'var(--bg-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">— Choose opportunity —</option>
                    {allOpps.map((opp) => (
                      <option key={opp.id} value={opp.id}>
                        {opp.title} · {opp.agency}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleAssign}
                      disabled={!assignOppId}
                      style={{
                        padding: '9px 20px',
                        background: assignOppId ? 'var(--accent-sage)' : 'var(--border)',
                        color: assignOppId ? '#fff' : 'var(--ink-muted)',
                        border: 'none',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: assignOppId ? 'pointer' : 'not-allowed',
                        letterSpacing: '0.02em',
                        transition: 'background 0.15s',
                      }}
                    >
                      Confirm Assignment
                    </button>
                    <button
                      onClick={() => { setShowAssign(false); setAssignOppId('') }}
                      style={{
                        padding: '9px 16px',
                        background: 'none',
                        color: 'var(--ink-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
