import { describe, it, expect } from 'vitest';
import {
  getScoreColor,
  getTierLabel,
  getStatusLabel,
  getStatusColor,
} from '@/utils/scoring';
import type { Score, Tier, OpportunityStatus } from '@/types/opportunity';

describe('getScoreColor', () => {
  it('high → green', () => {
    expect(getScoreColor('high')).toBe('#059669');
  });

  it('medium → orange/amber', () => {
    expect(getScoreColor('medium')).toBe('#D97706');
  });

  it('low → red', () => {
    expect(getScoreColor('low')).toBe('#DC2626');
  });

  it('returns a hex string for all score values', () => {
    const scores: Score[] = ['high', 'medium', 'low'];
    scores.forEach((s) => {
      expect(getScoreColor(s)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('getTierLabel', () => {
  it('returns "Tier 1" for tier 1', () => {
    expect(getTierLabel(1)).toBe('Tier 1');
  });

  it('returns "Tier 2" for tier 2', () => {
    expect(getTierLabel(2)).toBe('Tier 2');
  });

  it('returns "Tier 3" for tier 3', () => {
    expect(getTierLabel(3)).toBe('Tier 3');
  });

  it('always returns a non-empty string', () => {
    const tiers: Tier[] = [1, 2, 3];
    tiers.forEach((t) => {
      expect(getTierLabel(t)).toBeTruthy();
    });
  });
});

describe('getStatusLabel', () => {
  const cases: [OpportunityStatus, string][] = [
    ['radar',       'Radar'],
    ['qualified',   'Qualified'],
    ['jorge_review','Jorge Review'],
    ['contact',     'Contact'],
    ['proposal',    'Proposal'],
    ['submitted',   'Submitted'],
    ['won',         'Won'],
    ['lost',        'Lost'],
    ['dismissed',   'Dismissed'],
  ];

  cases.forEach(([status, expected]) => {
    it(`${status} → "${expected}"`, () => {
      expect(getStatusLabel(status)).toBe(expected);
    });
  });

  it('returns a non-empty string for all statuses', () => {
    cases.forEach(([status]) => {
      expect(getStatusLabel(status)).toBeTruthy();
    });
  });
});

describe('getStatusColor', () => {
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  const statuses: OpportunityStatus[] = [
    'radar', 'qualified', 'jorge_review', 'contact',
    'proposal', 'submitted', 'won', 'lost', 'dismissed',
  ];

  it('returns a hex color for all statuses', () => {
    statuses.forEach((s) => {
      expect(getStatusColor(s)).toMatch(hexPattern);
    });
  });

  it('won is green', () => {
    expect(getStatusColor('won')).toBe('#059669');
  });

  it('lost is red', () => {
    expect(getStatusColor('lost')).toBe('#DC2626');
  });

  it('radar is muted slate', () => {
    expect(getStatusColor('radar')).toBe('#94A3B8');
  });

  it('proposal is indigo', () => {
    expect(getStatusColor('proposal')).toBe('#6366F1');
  });

  it('each status has a distinct color', () => {
    const colors = statuses.map((s) => getStatusColor(s));
    const unique = new Set(colors);
    expect(unique.size).toBe(statuses.length);
  });
});
