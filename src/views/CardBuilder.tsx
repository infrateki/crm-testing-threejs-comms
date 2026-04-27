import { useCallback, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Opportunity, OpportunityStatus, Score, Tier } from '@/types/opportunity';
import { HeroSplitCard } from '@/components/cards/HeroSplitCard';
import { CardExporter } from '@/components/cards/CardExporter';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { PIPELINE_STAGES } from '@/types/pipeline';

const NOW = new Date().toISOString();

const BLANK_OPPORTUNITY: Opportunity = {
  id: 'builder-preview',
  title: 'Untitled Opportunity',
  agency: 'Agency Name',
  portal_id: null,
  status: 'radar',
  tier: 1,
  score: 'medium',
  owner: 'sergio',
  value: null,
  deadline: null,
  posted_date: NOW,
  due_date: null,
  description: '',
  notes: null,
  tags: [],
  naics_code: null,
  set_aside: null,
  ghl_contact_id: null,
  created_at: NOW,
  updated_at: NOW,
};

const OWNERS = ['jorge', 'sergio', 'julio', 'shami', 'jarvis'];
const SCENE_TYPES = [
  { value: 'mia', label: 'Terminal — Curved (Miami)' },
  { value: 'federal', label: 'Federal Building' },
  { value: 'dfw', label: 'Wide Terminal (Dallas)' },
  { value: 'lga', label: 'Modern Angular (New York)' },
  { value: 'mco', label: 'Curved Tower (Orlando)' },
];

interface TagEntry {
  id: string;
  value: string;
}

interface StatEntry {
  id: string;
  label: string;
  value: string;
}

export function CardBuilder() {
  const [opp, setOpp] = useState<Opportunity>({ ...BLANK_OPPORTUNITY });
  const [tags, setTags] = useState<TagEntry[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [stats, setStats] = useState<StatEntry[]>([]);
  const [sceneType, setSceneType] = useState('federal');
  const [illustrationMode, setIllustrationMode] = useState<'procedural' | 'photo'>('procedural');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { phase: uploadPhase, upload, result: uploadResult, error: uploadError } = usePhotoUpload();

  const update = useCallback(<K extends keyof Opportunity>(key: K, val: Opportunity[K]) => {
    setOpp((prev) => ({ ...prev, [key]: val }));
  }, []);

  function handleTagAdd() {
    const v = tagInput.trim();
    if (!v) return;
    const next = [...tags, { id: crypto.randomUUID(), value: v }];
    setTags(next);
    setOpp((prev) => ({ ...prev, tags: next.map((t) => t.value) }));
    setTagInput('');
  }

  function handleTagRemove(id: string) {
    const next = tags.filter((t) => t.id !== id);
    setTags(next);
    setOpp((prev) => ({ ...prev, tags: next.map((t) => t.value) }));
  }

  function handleStatAdd() {
    setStats((prev) => [...prev, { id: crypto.randomUUID(), label: '', value: '' }]);
  }

  function handleStatChange(id: string, field: 'label' | 'value', val: string) {
    setStats((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  }

  function handleStatRemove(id: string) {
    setStats((prev) => prev.filter((s) => s.id !== id));
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file);
  }

  const previewOpp: Opportunity = {
    ...opp,
    naics_code: illustrationMode === 'procedural' ? sceneType : opp.naics_code,
  };

  return (
    <div className="card-builder">
      <div className="card-builder__header">
        <SectionLabel>Card Builder</SectionLabel>
        <h1 className="card-builder__title">Build a Card</h1>
        <p className="card-builder__sub">
          Compose an opportunity card manually. Live preview updates as you type.
        </p>
      </div>

      <div className="card-builder__layout">
        {/* ── Form ─────────────────────────────────────── */}
        <aside className="card-builder__form">
          <section className="form-section">
            <div className="form-section__label">IDENTITY</div>

            <FieldRow label="Title">
              <input
                className="form-input"
                value={opp.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Opportunity title"
              />
            </FieldRow>

            <FieldRow label="Agency">
              <input
                className="form-input"
                value={opp.agency}
                onChange={(e) => update('agency', e.target.value)}
                placeholder="Agency / client name"
              />
            </FieldRow>

            <FieldRow label="Description">
              <textarea
                className="form-input form-input--textarea"
                value={opp.description ?? ''}
                onChange={(e) => update('description', e.target.value || null)}
                placeholder="Project scope or description…"
                rows={4}
              />
            </FieldRow>

            <FieldRow label="NAICS Code">
              <input
                className="form-input"
                value={opp.naics_code ?? ''}
                onChange={(e) => update('naics_code', e.target.value || null)}
                placeholder="e.g. 236220"
              />
            </FieldRow>

            <FieldRow label="Set-aside">
              <input
                className="form-input"
                value={opp.set_aside ?? ''}
                onChange={(e) => update('set_aside', e.target.value || null)}
                placeholder="e.g. Small Business"
              />
            </FieldRow>
          </section>

          <section className="form-section">
            <div className="form-section__label">PIPELINE</div>

            <FieldRow label="Status">
              <select
                className="form-input form-input--select"
                value={opp.status}
                onChange={(e) => update('status', e.target.value as OpportunityStatus)}
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </FieldRow>

            <FieldRow label="Tier">
              <select
                className="form-input form-input--select"
                value={opp.tier}
                onChange={(e) => update('tier', Number(e.target.value) as Tier)}
              >
                <option value={1}>Tier 1 — Strategic</option>
                <option value={2}>Tier 2 — Active</option>
                <option value={3}>Tier 3 — Monitor</option>
              </select>
            </FieldRow>

            <FieldRow label="Score">
              <select
                className="form-input form-input--select"
                value={opp.score}
                onChange={(e) => update('score', e.target.value as Score)}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </FieldRow>

            <FieldRow label="Owner">
              <select
                className="form-input form-input--select"
                value={opp.owner}
                onChange={(e) => update('owner', e.target.value)}
              >
                {OWNERS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </FieldRow>

            <FieldRow label="Est. Value ($)">
              <input
                className="form-input"
                type="number"
                min={0}
                value={opp.value ?? ''}
                onChange={(e) =>
                  update('value', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="e.g. 4800000"
              />
            </FieldRow>

            <FieldRow label="Deadline">
              <input
                className="form-input"
                type="date"
                value={opp.deadline ?? ''}
                onChange={(e) => update('deadline', e.target.value || null)}
              />
            </FieldRow>
          </section>

          <section className="form-section">
            <div className="form-section__label">TAGS</div>
            <div className="tag-input-row">
              <input
                className="form-input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()}
                placeholder="Add tag…"
              />
              <button className="form-btn" onClick={handleTagAdd} type="button">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="tag-list">
                {tags.map((t) => (
                  <span key={t.id} className="tag-pill">
                    {t.value}
                    <button
                      className="tag-pill__remove"
                      onClick={() => handleTagRemove(t.id)}
                      type="button"
                      aria-label={`Remove ${t.value}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="form-section">
            <div className="form-section__label">CUSTOM STATS</div>
            {stats.map((s) => (
              <div key={s.id} className="stat-row">
                <input
                  className="form-input"
                  value={s.label}
                  onChange={(e) => handleStatChange(s.id, 'label', e.target.value)}
                  placeholder="Label"
                />
                <input
                  className="form-input"
                  value={s.value}
                  onChange={(e) => handleStatChange(s.id, 'value', e.target.value)}
                  placeholder="Value"
                />
                <button
                  className="form-btn form-btn--ghost"
                  onClick={() => handleStatRemove(s.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
            <button className="form-btn form-btn--outline" onClick={handleStatAdd} type="button">
              + Add stat
            </button>
          </section>

          <section className="form-section">
            <div className="form-section__label">ILLUSTRATION</div>
            <div className="toggle-row">
              <button
                className={`toggle-btn ${illustrationMode === 'procedural' ? 'toggle-btn--active' : ''}`}
                onClick={() => setIllustrationMode('procedural')}
                type="button"
              >
                Procedural
              </button>
              <button
                className={`toggle-btn ${illustrationMode === 'photo' ? 'toggle-btn--active' : ''}`}
                onClick={() => setIllustrationMode('photo')}
                type="button"
              >
                Upload Photo
              </button>
            </div>

            {illustrationMode === 'procedural' && (
              <FieldRow label="Scene type">
                <select
                  className="form-input form-input--select"
                  value={sceneType}
                  onChange={(e) => setSceneType(e.target.value)}
                >
                  {SCENE_TYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </FieldRow>
            )}

            {illustrationMode === 'photo' && (
              <div className="photo-upload-area">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="photo-upload-input"
                  onChange={handlePhotoUpload}
                  aria-label="Upload photo"
                />
                <button
                  className="form-btn form-btn--outline"
                  onClick={() => fileRef.current?.click()}
                  type="button"
                  disabled={uploadPhase === 'uploading' || uploadPhase === 'processing' || uploadPhase === 'splitting'}
                >
                  {uploadPhase === 'idle' || uploadPhase === 'done' || uploadPhase === 'error'
                    ? 'Choose Photo'
                    : `${uploadPhase}…`}
                </button>
                {uploadError && (
                  <p className="upload-error">{uploadError}</p>
                )}
                {uploadResult && (
                  <p className="upload-success">Photo processed — {uploadResult.layers.length} layers ready</p>
                )}
              </div>
            )}
          </section>
        </aside>

        {/* ── Preview ───────────────────────────────────── */}
        <div className="card-builder__preview">
          <div className="preview-label">LIVE PREVIEW</div>
          <HeroSplitCard
            opportunity={previewOpp}
            onUploadPhoto={illustrationMode === 'photo' ? () => fileRef.current?.click() : undefined}
          />
          <CardExporter opportunity={previewOpp} canvasRef={canvasRef} />
        </div>
      </div>

      <style>{STYLES}</style>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field-row">
      <label className="field-row__label">{label}</label>
      {children}
    </div>
  );
}

const STYLES = `
.card-builder {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--content-padding);
}
.card-builder__header {
  margin-bottom: 32px;
}
.card-builder__title {
  font-family: var(--font-headline);
  font-size: 40px;
  font-weight: 900;
  color: var(--ink-primary);
  letter-spacing: -0.02em;
  margin: 12px 0 8px;
}
.card-builder__sub {
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--ink-tertiary);
  margin: 0;
}
.card-builder__layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 32px;
  align-items: start;
}
.card-builder__form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 8px;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-section__label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-muted);
  letter-spacing: 0.08em;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border-subtle);
}
.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-row__label {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-tertiary);
}
.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink-primary);
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: var(--ink-tertiary);
}
.form-input--textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}
.form-input--select {
  cursor: pointer;
}
.form-btn {
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;
}
.form-btn:hover:not(:disabled) {
  border-color: var(--ink-tertiary);
  color: var(--ink-primary);
}
.form-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.form-btn--outline {
  width: 100%;
  border-style: dashed;
}
.form-btn--ghost {
  border: none;
  background: none;
  padding: 0 8px;
  font-size: 18px;
  color: var(--ink-muted);
}
.tag-input-row {
  display: flex;
  gap: 8px;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: var(--bg-warm);
  border: 1px solid var(--border);
  border-radius: 3px;
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--ink-secondary);
}
.tag-pill__remove {
  border: none;
  background: none;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  color: var(--ink-muted);
  cursor: pointer;
}
.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 6px;
  align-items: center;
}
.toggle-row {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow: hidden;
}
.toggle-btn {
  flex: 1;
  padding: 8px;
  border: none;
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-tertiary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.toggle-btn--active {
  background: var(--bg-warm);
  color: var(--ink-primary);
}
.photo-upload-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.photo-upload-input {
  display: none;
}
.upload-error {
  font-family: var(--font-body);
  font-size: 12px;
  color: #DC2626;
  margin: 0;
}
.upload-success {
  font-family: var(--font-body);
  font-size: 12px;
  color: #059669;
  margin: 0;
}
.card-builder__preview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.preview-label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-muted);
  letter-spacing: 0.08em;
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 1023px) {
  .card-builder__layout {
    grid-template-columns: 1fr;
  }
  .card-builder__form {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
}
@media (max-width: 767px) {
  .card-builder__title { font-size: 28px; }
  .stat-row { grid-template-columns: 1fr 1fr auto; }
}
@media (max-width: 375px) {
  .stat-row { grid-template-columns: 1fr; }
  .stat-row .form-btn--ghost { grid-column: span 1; }
}
`;
