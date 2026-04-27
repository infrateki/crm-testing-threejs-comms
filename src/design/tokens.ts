export const colors = {
  bg: {
    primary: '#FFFFFF',
    cream: '#FAF8F3',
    warm: '#F5F3EF',
    card: '#FAFAFA',
  },
  ink: {
    primary: '#1a1a1a',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    muted: '#9CA3AF',
    ghost: '#D1D5DB',
  },
  accent: {
    slate: '#2C3E50',
    steel: '#34495E',
    sage: '#5C7C6B',
  },
  status: {
    tracking: '#6B7280',
    pursuing: '#2563EB',
    submitted: '#D97706',
    won: '#059669',
    lost: '#DC2626',
  },
  stage: {
    radar: '#94A3B8',
    qualified: '#8B5CF6',
    jorge_review: '#F59E0B',
    contact: '#3B82F6',
    proposal: '#6366F1',
    won: '#059669',
    lost: '#EF4444',
  },
  border: {
    default: '#E5E7EB',
    subtle: '#F3F4F6',
  },
} as const

export const typography = {
  fonts: {
    headline: "'Playfair Display', Georgia, serif",
    body: "'DM Sans', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  scale: {
    headline: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '36px',
      fontWeight: 900,
      color: '#1a1a1a',
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    headlineLg: {
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '48px',
      fontWeight: 900,
      color: '#1a1a1a',
      letterSpacing: '-0.02em',
      lineHeight: 1.1,
    },
    sectionLabel: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: '12px',
      fontWeight: 500,
      color: '#6B7280',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
    },
    body: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: '15px',
      fontWeight: 400,
      color: '#4B5563',
      lineHeight: 1.6,
    },
    bodyLg: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: '16px',
      fontWeight: 400,
      color: '#4B5563',
      lineHeight: 1.6,
    },
    statsValue: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '28px',
      fontWeight: 700,
      color: '#1a1a1a',
      letterSpacing: '-0.02em',
    },
    statsValueLg: {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '32px',
      fontWeight: 700,
      color: '#1a1a1a',
      letterSpacing: '-0.02em',
    },
    statsLabel: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: '11px',
      fontWeight: 400,
      color: '#9CA3AF',
      letterSpacing: '0.04em',
    },
  },
} as const

export const spacing = {
  contentPadding: {
    desktop: '40px',
    tablet: '24px',
    mobile: '16px',
  },
  gridGap: '24px',
  sectionSpacing: '32px',
  statsBarPadding: '20px',
} as const

export const card = {
  borderRadius: '3px',
  shadow: '0 1px 3px rgba(0,0,0,0.06)',
  border: '1px solid var(--border)',
} as const

export const breakpoints = {
  tablet: '768px',
  mobile: '375px',
} as const
