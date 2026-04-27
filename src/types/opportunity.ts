export type OpportunityStatus =
  | 'radar'
  | 'qualified'
  | 'jorge_review'
  | 'contact'
  | 'proposal'
  | 'submitted'
  | 'won'
  | 'lost'
  | 'dismissed';

export type Tier = 1 | 2 | 3;

export type Score = 'high' | 'medium' | 'low';

export interface StatItem {
  label: string;
  value: string | number;
}

export interface Photo {
  id: string;
  opportunity_id: string;
  url: string;
  caption: string | null;
  processed: boolean;
  created_at: string;
}

export interface Opportunity {
  id: string;
  title: string;
  agency: string;
  portal_id: string | null;
  status: OpportunityStatus;
  tier: Tier;
  score: Score;
  owner: string;
  value: number | null;
  deadline: string | null;
  posted_date: string;
  due_date: string | null;
  description: string | null;
  notes: string | null;
  tags: string[];
  naics_code: string | null;
  set_aside: string | null;
  ghl_contact_id: string | null;
  illustration_url?: string;
  contacts?: import('./contact').Contact[];
  photos?: Photo[];
  created_at: string;
  updated_at: string;
}
