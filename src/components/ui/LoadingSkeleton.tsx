interface LoadingSkeletonProps {
  variant?: 'card' | 'text-line' | 'stats-bar' | 'illustration';
  lines?: number;
}

export function LoadingSkeleton({ variant = 'card', lines = 3 }: LoadingSkeletonProps) {
  return (
    <>
      {variant === 'card' && <CardSkeleton />}
      {variant === 'text-line' && <TextLineSkeleton lines={lines} />}
      {variant === 'stats-bar' && <StatsBarSkeleton />}
      {variant === 'illustration' && <IllustrationSkeleton />}
      <style>{STYLES}</style>
    </>
  );
}

function CardSkeleton() {
  return (
    <div className="skel-card">
      <div className="skel-illustration shimmer" />
      <div className="skel-content">
        <div className="skel-label shimmer" />
        <div className="skel-title shimmer" />
        <div className="skel-title skel-title--short shimmer" />
        <div className="skel-line shimmer" />
        <div className="skel-line shimmer" />
        <div className="skel-line skel-line--short shimmer" />
      </div>
    </div>
  );
}

function TextLineSkeleton({ lines }: { lines: number }) {
  return (
    <div className="skel-lines">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`skel-line shimmer ${i === lines - 1 ? 'skel-line--short' : ''}`}
        />
      ))}
    </div>
  );
}

function StatsBarSkeleton() {
  return (
    <div className="skel-stats-bar">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="skel-stat">
          <div className="skel-stat-value shimmer" />
          <div className="skel-stat-label shimmer" />
        </div>
      ))}
    </div>
  );
}

function IllustrationSkeleton() {
  return <div className="skel-illustration-full shimmer" />;
}

const STYLES = `
.skel-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 3px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400px;
}
.skel-illustration {
  min-height: 300px;
}
.skel-illustration-full {
  width: 100%;
  height: 400px;
  border-radius: 3px;
}
.skel-content {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.skel-label {
  width: 80px;
  height: 11px;
  border-radius: 2px;
}
.skel-title {
  width: 100%;
  height: 28px;
  border-radius: 2px;
}
.skel-title--short { width: 65%; }
.skel-line {
  width: 100%;
  height: 14px;
  border-radius: 2px;
}
.skel-line--short { width: 55%; }
.skel-lines {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.skel-stats-bar {
  display: flex;
  border-top: 1px solid var(--border);
  background: var(--bg-cream);
}
.skel-stat {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid var(--border);
}
.skel-stat:last-child { border-right: none; }
.skel-stat-value {
  height: 28px;
  width: 70%;
  border-radius: 2px;
}
.skel-stat-label {
  height: 11px;
  width: 50%;
  border-radius: 2px;
}
.shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-warm) 0%,
    #ece9e1 40%,
    var(--bg-warm) 80%
  );
  background-size: 800px 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@media (max-width: 767px) {
  .skel-card {
    grid-template-columns: 1fr;
  }
  .skel-illustration {
    min-height: 200px;
  }
  .skel-content {
    padding: 24px 16px;
  }
}
`;
