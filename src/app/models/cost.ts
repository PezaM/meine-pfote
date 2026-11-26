export const COST_CATEGORIES = ['Tierarzt', 'Medikamente', 'Futter', 'Fahrtkosten', 'Sonstiges'] as const;

export type CostCategory = (typeof COST_CATEGORIES)[number];
export type CostStatus = 'Offen' | 'Freigegeben' | 'Abgelehnt';

export interface CostEntry {
  id: string;
  amount: number;
  date: string;
  category: CostCategory;
  description: string;
  animalId: string | null;
  fosterHomeId: string | null;
  receiptName: string | null;
  receiptAssigned: boolean;
  status: CostStatus;
}

export type CostDraft = Omit<CostEntry, 'id' | 'receiptAssigned' | 'status'>;
