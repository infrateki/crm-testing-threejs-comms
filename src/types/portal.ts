export type ScanMethod = 'scrape' | 'api' | 'rss' | 'manual';
export type ScanFrequency = 'hourly' | 'daily' | 'weekly';
export type LastScanStatus = 'success' | 'error' | 'pending' | 'running';

export interface Portal {
  id: string;
  name: string;
  url: string;
  scan_method: ScanMethod;
  scan_frequency: ScanFrequency;
  last_scan_status: LastScanStatus;
  last_scan_at: string | null;
  next_scan_at: string | null;
  opportunities_found: number;
  error_message: string | null;
  active: boolean;
  created_at: string;
}
