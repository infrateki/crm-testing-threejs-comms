export const PIPELINE_STAGES = [
  'radar',
  'qualified',
  'jorge_review',
  'contact',
  'proposal',
  'won',
  'lost',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface StageMetadata {
  id: PipelineStage;
  label: string;
  color: string;
}

export const STAGE_METADATA: Record<PipelineStage, StageMetadata> = {
  radar: { id: 'radar', label: 'Radar', color: '#94A3B8' },
  qualified: { id: 'qualified', label: 'Qualified', color: '#8B5CF6' },
  jorge_review: { id: 'jorge_review', label: 'Jorge Review', color: '#F59E0B' },
  contact: { id: 'contact', label: 'Contact', color: '#3B82F6' },
  proposal: { id: 'proposal', label: 'Proposal', color: '#6366F1' },
  won: { id: 'won', label: 'Won', color: '#059669' },
  lost: { id: 'lost', label: 'Lost', color: '#EF4444' },
};
