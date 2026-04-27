import type { Score, Tier, OpportunityStatus } from '@/types/opportunity';

const SCORE_COLORS: Record<Score, string> = {
  high: '#059669',
  medium: '#D97706',
  low: '#DC2626',
};

const TIER_LABELS: Record<Tier, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};

const STATUS_LABELS: Record<OpportunityStatus, string> = {
  radar: 'Radar',
  qualified: 'Qualified',
  jorge_review: 'Jorge Review',
  contact: 'Contact',
  proposal: 'Proposal',
  submitted: 'Submitted',
  won: 'Won',
  lost: 'Lost',
  dismissed: 'Dismissed',
};

const STATUS_COLORS: Record<OpportunityStatus, string> = {
  radar: '#94A3B8',
  qualified: '#8B5CF6',
  jorge_review: '#F59E0B',
  contact: '#3B82F6',
  proposal: '#6366F1',
  submitted: '#D97706',
  won: '#059669',
  lost: '#DC2626',
  dismissed: '#9CA3AF',
};

export function getScoreColor(score: Score): string {
  return SCORE_COLORS[score];
}

export function getTierLabel(tier: Tier): string {
  return TIER_LABELS[tier];
}

export function getStatusLabel(status: OpportunityStatus): string {
  return STATUS_LABELS[status];
}

export function getStatusColor(status: OpportunityStatus): string {
  return STATUS_COLORS[status];
}
