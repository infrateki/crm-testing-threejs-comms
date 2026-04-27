import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private _retry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return <ErrorFallback error={this.state.error} onRetry={this._retry} />;
    }
    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="error-boundary">
      <div className="error-boundary__inner">
        <GeometricArt />
        <div className="error-boundary__body">
          <p className="error-boundary__label">SYSTEM ERROR</p>
          <h2 className="error-boundary__title">Something went wrong</h2>
          {error && (
            <p className="error-boundary__message">{error.message}</p>
          )}
          <button className="error-boundary__retry" onClick={onRetry} type="button">
            Try again
          </button>
        </div>
      </div>
      <style>{STYLES}</style>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
function GeometricArt() {
  return (
    <svg
      className="error-boundary__art"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <rect x="20" y="20" width="80" height="80" stroke="#E5E7EB" strokeWidth="1" />
      <rect x="34" y="34" width="52" height="52" stroke="#E5E7EB" strokeWidth="1" />
      <line x1="20" y1="20" x2="100" y2="100" stroke="#E5E7EB" strokeWidth="1" />
      <line x1="100" y1="20" x2="20" y2="100" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="60" cy="60" r="18" stroke="#9CA3AF" strokeWidth="1" fill="none" />
      <circle cx="60" cy="60" r="4" fill="#9CA3AF" />
      <line x1="60" y1="36" x2="60" y2="20" stroke="#9CA3AF" strokeWidth="1" />
      <line x1="84" y1="60" x2="100" y2="60" stroke="#9CA3AF" strokeWidth="1" />
    </svg>
  );
}

const STYLES = `
.error-boundary {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-warm);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 40px 24px;
}
.error-boundary__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
  max-width: 360px;
}
.error-boundary__art {
  opacity: 0.7;
}
.error-boundary__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.error-boundary__label {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-muted);
  letter-spacing: 0.08em;
  margin: 0;
}
.error-boundary__title {
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  color: var(--ink-primary);
  margin: 0;
}
.error-boundary__message {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-tertiary);
  margin: 0;
  word-break: break-word;
}
.error-boundary__retry {
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
.error-boundary__retry:hover {
  border-color: var(--ink-tertiary);
  color: var(--ink-primary);
}
`;
