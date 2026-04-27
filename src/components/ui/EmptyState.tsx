interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <ProceduralLineArt />
      <div className="empty-state__body">
        <h3 className="empty-state__title">{title}</h3>
        {description && <p className="empty-state__desc">{description}</p>}
        {action && (
          <button className="empty-state__action" onClick={action.onClick} type="button">
            {action.label}
          </button>
        )}
      </div>
      <style>{STYLES}</style>
    </div>
  );
}

function ProceduralLineArt() {
  return (
    <svg
      className="empty-state__art"
      width="140"
      height="100"
      viewBox="0 0 140 100"
      fill="none"
      aria-hidden="true"
    >
      {/* Ground line */}
      <line x1="10" y1="90" x2="130" y2="90" stroke="#E5E7EB" strokeWidth="1" />
      {/* Building 1 */}
      <rect x="20" y="50" width="22" height="40" stroke="#E5E7EB" strokeWidth="1" fill="none" />
      <line x1="31" y1="50" x2="31" y2="90" stroke="#E5E7EB" strokeWidth="0.5" />
      <rect x="23" y="58" width="5" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="34" y="58" width="5" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="23" y="70" width="5" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="34" y="70" width="5" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      {/* Building 2 — taller */}
      <rect x="54" y="28" width="32" height="62" stroke="#D1D5DB" strokeWidth="1" fill="none" />
      <line x1="70" y1="28" x2="70" y2="90" stroke="#E5E7EB" strokeWidth="0.5" />
      <rect x="58" y="36" width="8" height="7" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="74" y="36" width="8" height="7" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="58" y="50" width="8" height="7" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="74" y="50" width="8" height="7" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="58" y="64" width="8" height="7" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="74" y="64" width="8" height="7" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="63" y="78" width="14" height="12" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      {/* Building 3 */}
      <rect x="98" y="60" width="24" height="30" stroke="#E5E7EB" strokeWidth="1" fill="none" />
      <rect x="102" y="66" width="6" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="112" y="66" width="6" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="102" y="78" width="6" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      <rect x="112" y="78" width="6" height="6" stroke="#E5E7EB" strokeWidth="0.5" fill="none" />
      {/* Antenna */}
      <line x1="70" y1="18" x2="70" y2="28" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="66" y1="22" x2="74" y2="22" stroke="#9CA3AF" strokeWidth="0.5" />
    </svg>
  );
}

const STYLES = `
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 60px 24px;
  text-align: center;
}
.empty-state__art {
  opacity: 0.8;
}
.empty-state__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 320px;
}
.empty-state__title {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-secondary);
  margin: 0;
}
.empty-state__desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ink-tertiary);
  line-height: 1.5;
  margin: 0;
}
.empty-state__action {
  margin-top: 8px;
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: var(--bg-primary);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-secondary);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.empty-state__action:hover {
  border-color: var(--ink-tertiary);
  color: var(--ink-primary);
}
`;
