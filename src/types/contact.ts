export interface Contact {
  id: string;
  opportunity_id: string;
  opportunity_ids: string[];
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  role_tag: string;
  agency: string | null;
  ghl_contact_id: string | null;
  notes: string | null;
  created_at: string;
}
