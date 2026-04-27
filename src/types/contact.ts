export interface Contact {
  id: string;
  opportunity_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role_tag: string;
  agency: string | null;
  ghl_contact_id: string | null;
  notes: string | null;
  created_at: string;
}
