import { useState } from 'react';
import type { RefObject } from 'react';
import type { Opportunity } from '@/types/opportunity';
import { exportAsPNG, exportAsSVG, downloadFile, svgToObjectURL } from '@/utils/export';

interface CardExporterProps {
  opportunity: Opportunity;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

type ExportState = 'idle' | 'working' | 'done' | 'error';

export function CardExporter({ opportunity, canvasRef }: CardExporterProps) {
  const [png, setPng] = useState<ExportState>('idle');
  const [svg, setSvg] = useState<ExportState>('idle');
  const [clip, setClip] = useState<ExportState>('idle');

  const slug = opportunity.title.slice(0, 32).replace(/\s+/g, '-').toLowerCase();

  async function handlePNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setPng('working');
    try {
      const dataURL = await exportAsPNG(canvas, opportunity, 2);
      downloadFile(dataURL, `bimsearch-${slug}.png`);
      _flash(setPng);
    } catch {
      _error(setPng);
    }
  }

  async function handleSVG() {
    setSvg('working');
    try {
      const canvas = canvasRef.current;
      const illustrationDataURL = canvas?.toDataURL('image/png') ?? '';
      const svgStr = exportAsSVG(illustrationDataURL, opportunity);
      const url = svgToObjectURL(svgStr);
      downloadFile(url, `bimsearch-${slug}.svg`);
      URL.revokeObjectURL(url);
      _flash(setSvg);
    } catch {
      _error(setSvg);
    }
  }

  async function handleClipboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setClip('working');
    try {
      const dataURL = await exportAsPNG(canvas, opportunity, 2);
      const res = await fetch(dataURL);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      _flash(setClip);
    } catch {
      _error(setClip);
    }
  }

  return (
    <div className="card-exporter">
      <div className="card-exporter__label">EXPORT CARD</div>
      <div className="card-exporter__row">
        <ExportButton state={png} onClick={handlePNG} label="Export as PNG" />
        <ExportButton state={svg} onClick={handleSVG} label="Export as SVG" />
        <ExportButton state={clip} onClick={handleClipboard} label="Copy to Clipboard" />
      </div>
      <style>{STYLES}</style>
    </div>
  );
}

function ExportButton({
  state,
  onClick,
  label,
}: {
  state: ExportState;
  onClick: () => void;
  label: string;
}) {
  const isWorking = state === 'working';
  const displayLabel =
    state === 'done' ? '✓ Done' : state === 'error' ? 'Error — retry' : label;

  return (
    <button
      className={`exporter-btn exporter-btn--${state}`}
      onClick={onClick}
      disabled={isWorking}
      type="button"
    >
      {isWorking && <Spinner />}
      {displayLabel}
    </button>
  );
}

function Spinner() {
  return (
    <span className="exporter-spinner" aria-hidden="true">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle
          cx="6.5"
          cy="6.5"
          r="5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="18"
          strokeDashoffset="6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function _flash(set: React.Dispatch<React.SetStateAction<ExportState>>) {
  set('done');
  setTimeout(() => set('idle'), 2200);
}

function _error(set: React.Dispatch<React.SetStateAction<ExportState>>) {
  set('error');
  setTimeout(() => set('idle'), 3500);
}

const STYLES = `
.card-exporter {
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  background: var(--bg-card);
}
.card-exporter__label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-muted);
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}
.card-exporter__row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.exporter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
}
.exporter-btn:hover:not(:disabled) {
  border-color: var(--ink-tertiary);
  color: var(--ink-primary);
}
.exporter-btn:disabled {
  opacity: 0.6;
  cursor: default;
}
.exporter-btn--done {
  border-color: #059669;
  color: #059669;
}
.exporter-btn--error {
  border-color: #DC2626;
  color: #DC2626;
}
.exporter-spinner {
  display: inline-flex;
  animation: exporter-spin 0.7s linear infinite;
}
@keyframes exporter-spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 767px) {
  .card-exporter__row { flex-direction: column; }
  .exporter-btn { width: 100%; justify-content: center; }
}
`;
